<?php

namespace App\Support;

class CareerWorkspaceDefaults
{
    public static function forUser(string $name, string $email): array
    {
        return [
            'profile' => [
                'fullName' => $name,
                'email' => $email,
                'targetRole' => 'Full Stack Developer',
                'location' => 'Jakarta, Indonesia',
                'linkedin' => '',
                'skills' => [],
            ],
            'preferences' => [
                'emailUpdates' => false,
                'jobAlerts' => true,
                'weeklyDigest' => true,
            ],
            'notifications' => [
                [
                    'id' => 'notice-score',
                    'titleId' => 'Analisis CV Anda siap digunakan',
                    'titleEn' => 'Your resume analysis is ready',
                    'bodyId' => 'Unggah CV untuk melihat keterampilan dan kecocokan lowongan.',
                    'bodyEn' => 'Upload a resume to see your skills and job matches.',
                    'route' => 'Resume analysis',
                    'unread' => true,
                ],
                [
                    'id' => 'notice-jobs',
                    'titleId' => 'Temukan posisi yang sesuai',
                    'titleEn' => 'Find roles that fit your profile',
                    'bodyId' => 'Rekomendasi pekerjaan diperbarui dari profil dan keahlian Anda.',
                    'bodyEn' => 'Job recommendations are based on your profile and skills.',
                    'route' => 'Job matches',
                    'unread' => true,
                ],
                [
                    'id' => 'notice-profile',
                    'titleId' => 'Lengkapi profil karier',
                    'titleEn' => 'Complete your career profile',
                    'bodyId' => 'Tambahkan keahlian dan posisi yang dituju untuk hasil lebih relevan.',
                    'bodyEn' => 'Add skills and a target role for more relevant results.',
                    'route' => 'Settings',
                    'unread' => false,
                ],
            ],
            'saved_jobs' => [],
            'tracked_jobs' => [],
            'completed_milestones' => [],
            'language' => 'id',
        ];
    }

    public static function milestoneIds(): array
    {
        return ['refresh-resume', 'portfolio', 'network', 'interview'];
    }
}
