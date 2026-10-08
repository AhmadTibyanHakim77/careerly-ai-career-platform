<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CareerWorkspaceTest extends TestCase
{
    use RefreshDatabase;

    public function test_workspace_endpoint_returns_a_profile_and_job_catalog(): void
    {
        $this->createAuthenticatedAccount();
        $this->seed();
        Http::preventStrayRequests();
        Http::fake([
            'www.arbeitnow.com/api/job-board-api' => Http::response(['data' => []], 200),
        ]);

        $this->getJson('/api/workspace')
            ->assertOk()
            ->assertJsonPath('profile.fullName', 'Test User');

        $this->getJson('/api/jobs?skills[]=React&targetRole=Full%20Stack%20Developer')
            ->assertOk()
            ->assertJsonFragment(['id' => 'github-fullstack', 'role' => 'Full Stack Developer']);
    }

    public function test_delete_resumes_removes_only_the_authenticated_users_private_files_and_analysis_records(): void
    {
        Storage::fake('local');
        $userId = $this->createAuthenticatedAccount();
        $path = 'resumes/private-resume.pdf';
        Storage::disk('local')->put($path, 'private resume contents');
        DB::table('career_workspaces')->where('user_id', $userId)->update([
            'profile' => json_encode(['fullName' => 'Test User', 'email' => 'test@example.test', 'skills' => ['Laravel']]),
        ]);
        DB::table('resumes')->insert([
            'user_id' => $userId,
            'original_filename' => 'resume.pdf',
            'private_path' => $path,
            'mime_type' => 'application/pdf',
            'file_size' => 24,
            'extracted_text' => null,
            'extracted_skills' => json_encode(['Laravel']),
            'score' => 75,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->deleteJson('/api/resumes')
            ->assertOk()
            ->assertJson(['deleted' => 1]);

        $this->assertDatabaseCount('resumes', 0);
        Storage::disk('local')->assertMissing($path);
        $profile = json_decode(DB::table('career_workspaces')->where('user_id', $userId)->value('profile'), true);
        $this->assertSame([], $profile['skills']);
    }

    public function test_deleting_resumes_never_deletes_another_accounts_file(): void
    {
        Storage::fake('local');
        $ownerId = $this->createAuthenticatedAccount();
        $path = 'resumes/owner-only.pdf';
        Storage::disk('local')->put($path, 'private resume contents');
        DB::table('resumes')->insert([
            'user_id' => $ownerId,
            'original_filename' => 'owner-only.pdf',
            'private_path' => $path,
            'mime_type' => 'application/pdf',
            'file_size' => 24,
            'extracted_text' => null,
            'extracted_skills' => json_encode(['Laravel']),
            'score' => 75,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->postJson('/api/auth/logout')->assertOk();
        $this->createAuthenticatedAccount('second@example.test');

        $this->deleteJson('/api/resumes')->assertOk()->assertJson(['deleted' => 0]);
        $this->assertDatabaseHas('resumes', ['user_id' => $ownerId, 'original_filename' => 'owner-only.pdf']);
        Storage::disk('local')->assertExists($path);
    }

    private function createAuthenticatedAccount(string $email = 'test@example.test'): int
    {
        return (int) $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => $email,
            'password' => 'safe-password-2026',
            'password_confirmation' => 'safe-password-2026',
        ])->assertCreated()->json('user.id');
    }
}
