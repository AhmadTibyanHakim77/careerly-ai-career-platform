<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('career_profiles', function (Blueprint $table) {
            $table->id();
            $table->json('profile');
            $table->timestamps();
        });
        Schema::create('career_preferences', function (Blueprint $table) {
            $table->id();
            $table->json('preferences');
            $table->timestamps();
        });
        Schema::create('job_postings', function (Blueprint $table) {
            $table->string('slug')->primary();
            $table->string('role');
            $table->string('company');
            $table->string('location');
            $table->string('employment_type');
            $table->string('salary')->nullable();
            $table->json('skills');
            $table->text('description_id');
            $table->text('description_en');
            $table->string('mark', 8)->nullable();
            $table->string('color')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
        Schema::create('saved_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('job_slug');
            $table->timestamps();
            $table->unique('job_slug');
            $table->foreign('job_slug')->references('slug')->on('job_postings')->cascadeOnDelete();
        });
        Schema::create('job_applications', function (Blueprint $table) {
            $table->id();
            $table->string('job_slug');
            $table->string('status')->default('saved');
            $table->text('notes')->nullable();
            $table->timestamp('applied_at')->nullable();
            $table->timestamps();
            $table->unique('job_slug');
            $table->foreign('job_slug')->references('slug')->on('job_postings')->cascadeOnDelete();
        });
        Schema::create('career_notifications', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('title_id');
            $table->string('title_en');
            $table->text('body_id');
            $table->text('body_en');
            $table->string('route')->default('Overview');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
        Schema::create('career_milestones', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->boolean('completed')->default(false);
            $table->timestamps();
        });
        Schema::create('resumes', function (Blueprint $table) {
            $table->id();
            $table->string('original_filename');
            $table->string('private_path');
            $table->string('mime_type');
            $table->unsignedBigInteger('file_size');
            $table->longText('extracted_text')->nullable();
            $table->json('extracted_skills');
            $table->unsignedTinyInteger('score')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['resumes', 'career_milestones', 'career_notifications', 'job_applications', 'saved_jobs', 'job_postings', 'career_preferences', 'career_profiles'] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
