<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('careerly:send-weekly-digest')
    ->weeklyOn(1, '08:00')
    ->timezone('Asia/Jakarta')
    ->withoutOverlapping();

Schedule::command('careerly:send-daily-job-alerts')
    ->dailyAt('08:15')
    ->timezone('Asia/Jakarta')
    ->withoutOverlapping();
