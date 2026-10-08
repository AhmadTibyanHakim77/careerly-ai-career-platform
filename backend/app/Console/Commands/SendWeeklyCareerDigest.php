<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class SendWeeklyCareerDigest extends Command
{
    protected $signature = 'careerly:send-weekly-digest';

    protected $description = 'Send a weekly career progress email to users who opted in';

    public function handle(): int
    {
        $recipients = DB::table('career_workspaces')
            ->join('users', 'career_workspaces.user_id', '=', 'users.id')
            ->select(['career_workspaces.*', 'users.name', 'users.email'])
            ->get()
            ->filter(fn ($workspace): bool => (bool) (json_decode($workspace->preferences, true)['weeklyDigest'] ?? false));

        foreach ($recipients as $workspace) {
            $profile = json_decode($workspace->profile, true) ?: [];
            $savedJobs = json_decode($workspace->saved_jobs, true) ?: [];
            $trackedJobs = json_decode($workspace->tracked_jobs, true) ?: [];
            $resume = DB::table('resumes')->where('user_id', $workspace->user_id)->latest('id')->first();
            $lines = [
                'Halo '.$workspace->name.',',
                '',
                'Ini ringkasan ruang kerja karier Anda minggu ini.',
                'Posisi yang disimpan: '.count($savedJobs),
                'Posisi di pelacak lamaran: '.count($trackedJobs),
                'Target karier: '.($profile['targetRole'] ?? 'Belum diatur'),
                'Skor CV terakhir: '.($resume ? $resume->score.'/100' : 'Belum ada analisis'),
                '',
                'Buka Careerly untuk melanjutkan langkah karier Anda.',
            ];

            try {
                Mail::raw(implode("\n", $lines), function ($message) use ($workspace): void {
                    $message->to($workspace->email)->subject('Ringkasan karier mingguan Careerly');
                });
                $this->info('Digest sent: '.$workspace->email);
            } catch (\Throwable $exception) {
                $this->error('Digest failed for '.$workspace->email.' ('.$exception::class.').');
            }
        }

        $this->info('Recipients: '.$recipients->count());

        return self::SUCCESS;
    }
}
