<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class JobSourceService
{
    public function listings(): array
    {
        $cached = Cache::get('careerly:arbeitnow:jobs');
        if (is_array($cached)) {
            return $cached;
        }

        try {
            $response = Http::acceptJson()
                ->connectTimeout(4)
                ->timeout(10)
                ->get(config('services.arbeitnow.endpoint'));

            if (! $response->successful()) {
                return [];
            }

            $jobs = collect($response->json('data', []))
                ->filter(fn ($job): bool => is_array($job) && ! empty($job['slug']) && ! empty($job['title']) && ! empty($job['url']))
                ->take(100)
                ->map(function (array $job): array {
                    $skills = collect($job['tags'] ?? [])
                        ->filter(fn ($tag): bool => is_string($tag) && trim($tag) !== '')
                        ->map(fn (string $tag): string => Str::limit(trim($tag), 60, ''))
                        ->take(12)
                        ->values()
                        ->all();

                    $applyUrl = filter_var($job['url'], FILTER_VALIDATE_URL) && in_array(parse_url($job['url'], PHP_URL_SCHEME), ['https', 'http'], true)
                        ? $job['url']
                        : null;

                    if (! $applyUrl) {
                        return [];
                    }

                    $createdAt = null;
                    try {
                        if (isset($job['created_at'])) {
                            $createdAt = is_numeric($job['created_at'])
                                ? now()->setTimestamp((int) $job['created_at'])->toDateString()
                                : now()->parse($job['created_at'])->toDateString();
                        }
                    } catch (\Throwable) {
                        $createdAt = null;
                    }

                    return [
                        'id' => 'arbeitnow-'.Str::slug((string) $job['slug']),
                        'role' => Str::limit(trim((string) $job['title']), 160, ''),
                        'company' => Str::limit(trim((string) ($job['company_name'] ?? 'Perusahaan')), 100, ''),
                        'location' => Str::limit(trim((string) ($job['location'] ?? 'Remote')), 140, ''),
                        'type' => Str::limit(trim((string) (collect($job['job_types'] ?? [])->filter()->first() ?? 'Full-time')), 50, ''),
                        'salary' => null,
                        'skills' => $skills,
                        'descriptionId' => Str::limit(trim(strip_tags(html_entity_decode((string) ($job['description'] ?? ''), ENT_QUOTES | ENT_HTML5, 'UTF-8'))), 1800, '…'),
                        'descriptionEn' => Str::limit(trim(strip_tags(html_entity_decode((string) ($job['description'] ?? ''), ENT_QUOTES | ENT_HTML5, 'UTF-8'))), 1800, '…'),
                        'mark' => Str::upper(mb_substr(trim((string) ($job['company_name'] ?? 'C')), 0, 1)),
                        'color' => 'bg-slate-100 text-slate-700',
                        'source' => 'Arbeitnow',
                        'applyUrl' => $applyUrl,
                        'postedAt' => $createdAt,
                        'remote' => (bool) ($job['remote'] ?? false),
                    ];
                })
                ->filter()
                ->values()
                ->all();

            Cache::put('careerly:arbeitnow:jobs', $jobs, now()->addMinutes(20));

            return $jobs;
        } catch (\Throwable) {
            return [];
        }
    }
}
