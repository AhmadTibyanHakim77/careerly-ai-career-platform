<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('career_workspaces', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->json('profile');
            $table->json('preferences');
            $table->json('notifications');
            $table->json('saved_jobs');
            $table->json('tracked_jobs');
            $table->json('completed_milestones');
            $table->string('language', 2)->default('id');
            $table->timestamps();
        });

        Schema::table('resumes', function (Blueprint $table): void {
            $table->foreignId('user_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
            $table->text('analysis_summary')->nullable();
            $table->json('strengths')->nullable();
            $table->json('improvements')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('resumes', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('user_id');
            $table->dropColumn(['analysis_summary', 'strengths', 'improvements']);
        });
        Schema::dropIfExists('career_workspaces');
    }
};
