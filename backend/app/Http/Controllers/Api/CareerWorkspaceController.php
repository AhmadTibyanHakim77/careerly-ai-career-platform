<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\JobSourceService;
use App\Services\ResumeAiAnalyzer;
use App\Support\CareerWorkspaceDefaults;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Smalot\PdfParser\Parser as PdfParser;
use ZipArchive;

class CareerWorkspaceController extends Controller
{
    public function health()
    {
        DB::select('select 1');

        return response()->json([
            'status' => 'ok',
            'database' => DB::connection()->getDriverName(),
            'aiEnabled' => filled(config('services.openai.key')),
        ]);
    }

    public function workspace(Request $request)
    {
        $user = $request->user();
        $workspace = $this->ensureWorkspace($user);
        $resume = DB::table('resumes')->where('user_id', $user->id)->latest('id')->first();
        $scoreHistory = DB::table('resumes')
            ->where('user_id', $user->id)
            ->orderByDesc('id')
            ->limit(8)
            ->get()
            ->reverse()
            ->values()
            ->map(fn ($item) => [
                'week' => date('j M', strtotime($item->created_at)),
                'score' => (int) $item->score,
            ]);

        return response()->json([
            'profile' => json_decode($workspace->profile, true) ?: [],
            'preferences' => json_decode($workspace->preferences, true) ?: [],
            'language' => $workspace->language,
            'notifications' => json_decode($workspace->notifications, true) ?: [],
            'savedJobs' => json_decode($workspace->saved_jobs, true) ?: [],
            'trackedJobs' => json_decode($workspace->tracked_jobs, true) ?: [],
            'completedMilestones' => json_decode($workspace->completed_milestones, true) ?: [],
            'resumeName' => $resume?->original_filename,
            'resumeScore' => $resume ? (int) $resume->score : null,
            'resumeSkills' => $resume ? (json_decode($resume->extracted_skills, true) ?: []) : [],
            'resumeSummary' => $resume?->analysis_summary,
            'resumeStrengths' => $resume ? (json_decode($resume->strengths ?? '[]', true) ?: []) : [],
            'resumeImprovements' => $resume ? (json_decode($resume->improvements ?? '[]', true) ?: []) : [],
            'scoreHistory' => $scoreHistory,
            'aiEnabled' => filled(config('services.openai.key')),
        ]);
    }

    public function updateWorkspace(Request $request)
    {
        $workspace = $this->ensureWorkspace($request->user());
        $data = $request->validate([
            'profile' => ['required', 'array'],
            'profile.fullName' => ['required', 'string', 'max:100'],
            'profile.email' => ['nullable', 'email:rfc', 'max:180'],
            'profile.targetRole' => ['nullable', 'string', 'max:120'],
            'profile.location' => ['nullable', 'string', 'max:160'],
            'profile.linkedin' => ['nullable', 'string', 'max:255'],
            'profile.skills' => ['sometimes', 'array', 'max:50'],
            'profile.skills.*' => ['string', 'max:60'],
            'preferences' => ['required', 'array'],
            'preferences.emailUpdates' => ['required', 'boolean'],
            'preferences.jobAlerts' => ['required', 'boolean'],
            'preferences.weeklyDigest' => ['required', 'boolean'],
            'savedJobs' => ['present', 'array', 'max:100'],
            'savedJobs.*' => ['string', 'max:255'],
            'trackedJobs' => ['present', 'array', 'max:100'],
            'trackedJobs.*' => ['string', 'max:255'],
            'completedMilestones' => ['present', 'array', 'max:4'],
            'completedMilestones.*' => ['string', 'in:'.implode(',', CareerWorkspaceDefaults::milestoneIds())],
            'notifications' => ['present', 'array', 'max:100'],
            'notifications.*.id' => ['required', 'string', 'max:100'],
            'notifications.*.unread' => ['required', 'boolean'],
            'language' => ['required', 'in:id,en'],
        ]);

        $currentNotifications = json_decode($workspace->notifications, true) ?: [];
        $unreadById = collect($data['notifications'])->keyBy('id')->map(fn ($notice) => (bool) $notice['unread']);
        $notifications = array_map(function (array $notice) use ($unreadById): array {
            if ($unreadById->has($notice['id'])) {
                $notice['unread'] = $unreadById->get($notice['id']);
            }

            return $notice;
        }, $currentNotifications);

        DB::table('career_workspaces')->where('user_id', $request->user()->id)->update([
            'profile' => json_encode($data['profile'], JSON_UNESCAPED_UNICODE),
            'preferences' => json_encode($data['preferences']),
            'notifications' => json_encode($notifications, JSON_UNESCAPED_UNICODE),
            'saved_jobs' => json_encode(array_values(array_unique($data['savedJobs']))),
            'tracked_jobs' => json_encode(array_values(array_unique($data['trackedJobs']))),
            'completed_milestones' => json_encode(array_values(array_unique($data['completedMilestones']))),
            'language' => $data['language'],
            'updated_at' => now(),
        ]);

        return response()->json(['saved' => true]);
    }

    public function jobs(Request $request, JobSourceService $jobSource)
    {
        $validated = $request->validate([
            'skills' => ['sometimes', 'array', 'max:50'],
            'skills.*' => ['string', 'max:60'],
            'targetRole' => ['sometimes', 'string', 'max:120'],
        ]);
        $skills = $validated['skills'] ?? [];
        $targetRole = (string) ($validated['targetRole'] ?? '');
        $jobs = $this->jobListings($skills, $targetRole, $jobSource);

        return response()->json(['jobs' => $jobs, 'liveSource' => 'Arbeitnow']);
    }

    public function uploadResume(Request $request, ResumeAiAnalyzer $aiAnalyzer, JobSourceService $jobSource)
    {
        $data = $request->validate([
            'file' => ['required', 'file', 'mimes:pdf,docx', 'max:10240'],
            'ai_consent' => ['sometimes', 'boolean'],
        ]);
        $file = $data['file'];
        $extension = strtolower($file->getClientOriginalExtension());

        try {
            $text = $extension === 'pdf'
                ? (new PdfParser)->parseFile($file->getRealPath())->getText()
                : $this->extractDocx($file->getRealPath());
        } catch (\Throwable) {
            return response()->json(['message' => 'Isi CV tidak dapat dibaca. Pastikan PDF memiliki teks atau file DOCX tidak rusak.'], 422);
        }

        $text = trim(preg_replace('/\s+/u', ' ', $text) ?? '');
        if (mb_strlen($text) < 40) {
            return response()->json(['message' => 'Teks CV terlalu sedikit untuk dianalisis. Jika PDF berupa hasil scan, ubah ke PDF yang memiliki teks atau unggah DOCX.'], 422);
        }

        $skills = $this->extractSkills($text);
        $score = min(100, 35 + count($skills) * 5 + (preg_match('/\b(experience|pengalaman|education|pendidikan|project|proyek)\b/i', $text) ? 15 : 0));
        $summary = 'Analisis berbasis aturan: skor dihitung dari keahlian dan bagian pengalaman, pendidikan, atau proyek yang terdeteksi.';
        $strengths = $skills ? ['Keahlian teridentifikasi: '.implode(', ', array_slice($skills, 0, 6)).'.'] : [];
        $improvements = ['Tambahkan hasil kerja yang terukur dan konteks dampaknya.', 'Sesuaikan ringkasan CV dengan posisi yang dituju.'];
        $method = 'keyword-matching';

        if (($data['ai_consent'] ?? false) && filled(config('services.openai.key'))) {
            $aiAnalysis = $aiAnalyzer->analyze($text);
            if ($aiAnalysis) {
                $score = $aiAnalysis['score'];
                $skills = $aiAnalysis['skills'] ?: $skills;
                $summary = $aiAnalysis['summary'];
                $strengths = $aiAnalysis['strengths'];
                $improvements = $aiAnalysis['improvements'];
                $method = 'openai';
            }
        }

        $path = $file->store('resumes', 'local');
        if (! $path) {
            return response()->json(['message' => 'File CV gagal disimpan. Periksa ruang penyimpanan server.'], 500);
        }

        $user = $request->user();
        try {
            $resumeId = DB::transaction(function () use ($file, $path, $skills, $score, $summary, $strengths, $improvements, $user): int {
                $resumeId = DB::table('resumes')->insertGetId([
                    'user_id' => $user->id,
                    'original_filename' => mb_substr($file->getClientOriginalName(), 0, 255),
                    'private_path' => $path,
                    'mime_type' => $file->getMimeType() ?: 'application/octet-stream',
                    'file_size' => $file->getSize(),
                    'extracted_text' => null,
                    'extracted_skills' => json_encode($skills, JSON_UNESCAPED_UNICODE),
                    'score' => $score,
                    'analysis_summary' => $summary,
                    'strengths' => json_encode($strengths, JSON_UNESCAPED_UNICODE),
                    'improvements' => json_encode($improvements, JSON_UNESCAPED_UNICODE),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $workspace = $this->ensureWorkspace($user);
                $profile = json_decode($workspace->profile, true) ?: [];
                $profile['skills'] = $skills;
                DB::table('career_workspaces')->where('user_id', $user->id)->update([
                    'profile' => json_encode($profile, JSON_UNESCAPED_UNICODE),
                    'updated_at' => now(),
                ]);

                return $resumeId;
            });
        } catch (\Throwable $exception) {
            Storage::disk('local')->delete($path);
            throw $exception;
        }

        $profile = json_decode($this->ensureWorkspace($user)->profile, true) ?: [];
        $matches = collect($this->jobListings($skills, (string) ($profile['targetRole'] ?? ''), $jobSource))
            ->take(5)
            ->map(fn ($job) => [
                'id' => $job['id'],
                'role' => $job['role'],
                'company' => $job['company'],
                'match' => $job['match'],
                'matchedSkills' => $job['matchedSkills'],
                'applyUrl' => $job['applyUrl'],
                'source' => $job['source'],
            ])
            ->values();

        return response()->json([
            'id' => $resumeId,
            'resumeName' => $file->getClientOriginalName(),
            'score' => $score,
            'skills' => $skills,
            'summary' => $summary,
            'strengths' => $strengths,
            'improvements' => $improvements,
            'matches' => $matches,
            'method' => $method,
        ], 201);
    }

    public function deleteResumes(Request $request)
    {
        $userId = $request->user()->id;
        $resumes = DB::table('resumes')->where('user_id', $userId)->get(['private_path']);
        $disk = Storage::disk('local');

        foreach ($resumes as $resume) {
            if ($disk->exists($resume->private_path) && ! $disk->delete($resume->private_path)) {
                return response()->json(['message' => 'Sebagian file CV tidak dapat dihapus. Silakan coba lagi.'], 500);
            }
        }

        $deleted = DB::transaction(function () use ($userId): int {
            $deleted = DB::table('resumes')->where('user_id', $userId)->delete();
            $workspace = DB::table('career_workspaces')->where('user_id', $userId)->first();

            if ($workspace) {
                $profile = json_decode($workspace->profile, true) ?: [];
                $profile['skills'] = [];
                DB::table('career_workspaces')->where('user_id', $userId)->update([
                    'profile' => json_encode($profile, JSON_UNESCAPED_UNICODE),
                    'updated_at' => now(),
                ]);
            }

            return $deleted;
        });

        return response()->json(['deleted' => $deleted]);
    }

    private function ensureWorkspace(User $user): object
    {
        $workspace = DB::table('career_workspaces')->where('user_id', $user->id)->first();
        if ($workspace) {
            return $workspace;
        }

        $defaults = CareerWorkspaceDefaults::forUser($user->name, $user->email);
        DB::table('career_workspaces')->insert([
            'user_id' => $user->id,
            'profile' => json_encode($defaults['profile'], JSON_UNESCAPED_UNICODE),
            'preferences' => json_encode($defaults['preferences']),
            'notifications' => json_encode($defaults['notifications'], JSON_UNESCAPED_UNICODE),
            'saved_jobs' => json_encode($defaults['saved_jobs']),
            'tracked_jobs' => json_encode($defaults['tracked_jobs']),
            'completed_milestones' => json_encode($defaults['completed_milestones']),
            'language' => $defaults['language'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return DB::table('career_workspaces')->where('user_id', $user->id)->first();
    }

    private function jobListings(array $skills, string $targetRole, JobSourceService $jobSource): array
    {
        $targetRole = mb_strtolower(trim($targetRole));
        $allJobs = DB::table('job_postings')
            ->where('is_active', true)
            ->get()
            ->map(fn ($job) => [
                'id' => $job->slug,
                'role' => $job->role,
                'company' => $job->company,
                'location' => $job->location,
                'type' => $job->employment_type,
                'salary' => $job->salary,
                'skills' => json_decode($job->skills, true) ?: [],
                'descriptionId' => $job->description_id,
                'descriptionEn' => $job->description_en,
                'mark' => $job->mark,
                'color' => $job->color,
                'source' => 'Careerly sample',
                'applyUrl' => null,
                'postedAt' => null,
                'remote' => str_contains(mb_strtolower($job->location), 'remote'),
            ])
            ->merge(collect($jobSource->listings())->map(function (array $job) {
                $required = $job['skills'];
                unset($job['skills']);

                return [...$job, 'skills' => $required];
            }))
            ->map(function (array $job) use ($skills, $targetRole): array {
                $required = $job['skills'];
                $matched = array_values(array_filter($required, fn ($skill) => $this->hasSkill($skills, $skill)));
                $match = count($skills) === 0 ? 0 : (int) round(count($matched) / max(count($required), 1) * 100);
                $role = mb_strtolower($job['role']);
                $roleMatch = $targetRole !== '' && (str_contains($role, $targetRole) || str_contains($targetRole, $role));
                if ($roleMatch) {
                    $match = max($match, count($skills) === 0 ? 45 : min(100, $match + 10));
                }

                return [...$job, 'match' => $match, 'matchedSkills' => $matched];
            })
            ->sortByDesc('match')
            ->values()
            ->all();

        return $allJobs;
    }

    private function extractDocx(string $path): string
    {
        $zip = new ZipArchive;
        if ($zip->open($path) !== true) {
            throw new \RuntimeException('Invalid DOCX archive.');
        }
        $xml = $zip->getFromName('word/document.xml');
        $zip->close();
        if ($xml === false) {
            throw new \RuntimeException('DOCX content is missing.');
        }
        $document = new \DOMDocument;
        $document->loadXML($xml, LIBXML_NONET | LIBXML_NOBLANKS);

        return $document->textContent;
    }

    private function extractSkills(string $text): array
    {
        $catalog = [
            'React' => ['react', 'react.js', 'reactjs'], 'TypeScript' => ['typescript', 'ts'],
            'JavaScript' => ['javascript', 'js'], 'Node.js' => ['node.js', 'nodejs'],
            'PHP' => ['php'], 'Laravel' => ['laravel'], 'SQL' => ['sql', 'structured query language'],
            'MySQL' => ['mysql'], 'PostgreSQL' => ['postgresql', 'postgres'], 'Python' => ['python'],
            'Data analysis' => ['data analysis', 'analisis data', 'data analytics'], 'Figma' => ['figma'],
            'Product design' => ['product design', 'desain produk'], 'UX research' => ['ux research', 'user research', 'riset pengguna'],
            'Design systems' => ['design system', 'design systems', 'sistem desain'], 'API design' => ['api', 'rest api'],
            'Docker' => ['docker'], 'AWS' => ['aws', 'amazon web services'], 'Git' => ['git', 'github'],
            'HTML' => ['html'], 'CSS' => ['css'], 'Tailwind CSS' => ['tailwind'],
            'Tableau' => ['tableau'], 'Power BI' => ['power bi'], 'Statistics' => ['statistics', 'statistik'],
            'Communication' => ['communication', 'komunikasi'], 'Project management' => ['project management', 'manajemen proyek'],
        ];
        $lower = mb_strtolower($text);
        $found = [];
        foreach ($catalog as $skill => $aliases) {
            foreach ($aliases as $alias) {
                if (preg_match('/(?<![\pL\pN])'.preg_quote($alias, '/').'(?![\pL\pN])/iu', $lower)) {
                    $found[] = $skill;
                    break;
                }
            }
        }

        return $found;
    }

    private function hasSkill(array $skills, string $target): bool
    {
        $aliases = [
            'Node.js' => ['node.js', 'nodejs'],
            'SQL' => ['sql', 'mysql', 'postgresql'],
            'API design' => ['api', 'rest api'],
            'Product design' => ['product design', 'figma'],
        ];
        $needles = array_map(fn ($value) => mb_strtolower($value), array_merge([$target], $aliases[$target] ?? []));
        foreach ($skills as $skill) {
            if (in_array(mb_strtolower($skill), $needles, true)) {
                return true;
            }
            foreach ($needles as $needle) {
                if (str_contains(mb_strtolower($skill), $needle)) {
                    return true;
                }
            }
        }

        return false;
    }
}
