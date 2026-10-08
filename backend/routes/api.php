<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CareerWorkspaceController;
use Illuminate\Support\Facades\Route;

Route::get('/health', [CareerWorkspaceController::class, 'health'])->middleware('throttle:60,1');

Route::prefix('auth')->middleware(['web', 'throttle:10,1'])->group(function (): void {
    Route::get('/csrf', [AuthController::class, 'csrf']);
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:5,1');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:5,1');
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:5,1');
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth');
    Route::get('/me', [AuthController::class, 'me'])->middleware('auth');
});

Route::middleware(['web', 'auth', 'throttle:60,1'])->group(function (): void {
    Route::post('/account/test-email', [AuthController::class, 'testEmail']);
    Route::get('/workspace', [CareerWorkspaceController::class, 'workspace']);
    Route::put('/workspace', [CareerWorkspaceController::class, 'updateWorkspace']);
    Route::get('/jobs', [CareerWorkspaceController::class, 'jobs']);
    Route::post('/resumes', [CareerWorkspaceController::class, 'uploadResume']);
    Route::delete('/resumes', [CareerWorkspaceController::class, 'deleteResumes']);
});
