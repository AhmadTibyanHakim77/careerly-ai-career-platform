<?php

namespace App\Console\Commands;

use App\Services\JobSourceService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class SendDailyJobAlerts extends Command
{
    protected $signature = 'careerly:send-daily-job-alerts';

    protected $description = 'Send relevant current job listings to users who opted in';

    public function handle(JobSourceService $jobSource): int
    {
        $listings = $jobSource->listings();
        if ($listings === []) {
            $this->warn('The live job provider is unavailable; no alerts were sent.');

            return self::SUCCESS;
        }

        $workspaces = DB::table('career_workspaces')
            ->join('users', 'career_workspaces.user_id', '=', 'users.id')
            ->select(['career_workspaces.*', 'users.name', 'users.email'])
            ->get()
            ->filter(fn ($workspace): bool => (bool) (json_decode($workspace->preferences, true)['jobAlerts'] ?? false));

        foreach ($workspaces as $workspace) {
            $profile = json_decode($workspace->profile, true) ?: [];
            $skills = array_map(fn ($skill) => mb_strtolower((string) $skill), $profile['skills'] ?? []);
            $role = mb_strtolower((string) ($profile['targetRole'] ?? ''));

            $matches = collect($listings)->map(function (array $job) use ($skills, $role): array {
                $required = array_map(fn ($skill) => mb_strtolower((string) $skill), $job['skills'] ?? []);
                $matched = array_filter($required, fn ($skill) => collect($skills)->contains(fn ($owned) => $owned === $skill || str_contains($owned, $skill) || str_contains($skill, $owned)));
                $score = $required === [] ? 0 : (int) round(count($matched) / count($required) * 100);
                $roleMatch = $role !== '' && (str_contains(mb_strtolower($job['role']), $role) || str_contains($role, mb_strtolower($job['role'])));
                if ($roleMatch) {
                    $score = max($score, $skills === [] ? 45 : min(100, $score + 10));
                }

                return [...$job, 'match' => $score];
            })
                ->filter(fn (array $job): bool => $job['match'] >= 30)
                ->sortByDesc('match')
                ->take(3)
                ->values();

            if ($matches->isEmpty()) {
                continue;
            }

            $lines = [
                'Halo '.$workspace->name.',',
                '',
                'Berikut beberapa lowongan terbaru yang cocok dengan target karier atau keahlian Anda:',
                '',
            ];
            foreach ($matches as $job) {
                $lines[] = $job['role'].' — '.$job['company'].' (perkiraan kecocokan '.$job['match'].'%)';
                $lines[] = $job['location'].' · '.$job['applyUrl'];
                $lines[] = '';
            }
            $lines[] = 'Lowongan dapat berubah atau ditutup. Periksa detail dan persyaratan di situs perusahaan sebelum melamar.';

            try {
                Mail::raw(implode("\n", $lines), function ($message) use ($workspace): void {
                    $message->to($workspace->email)->subject('Lowongan yang cocok untuk Anda — Careerly');
                });
                $this->info('Job alert sent: '.$workspace->email);
            } catch (\Throwable $exception) {
                $this->error('Job alert failed for '.$workspace->email.' ('.$exception::class.').');
            }
        }

        $this->info('Eligible accounts: '.$workspaces->count());

        return self::SUCCESS;
    }
}
