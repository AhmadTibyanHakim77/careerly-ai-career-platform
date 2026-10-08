<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CareerAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_workspace_api_requires_an_authenticated_account(): void
    {
        $this->getJson('/api/workspace')->assertUnauthorized();
        $this->getJson('/api/jobs')->assertUnauthorized();
    }

    public function test_registration_creates_a_private_workspace_for_the_new_account(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Ahmad Tibyan',
            'email' => 'ahmad@example.test',
            'password' => 'safe-password-2026',
            'password_confirmation' => 'safe-password-2026',
        ]);

        $response->assertCreated()->assertJsonPath('user.email', 'ahmad@example.test');
        $userId = $response->json('user.id');

        $this->assertDatabaseHas('career_workspaces', [
            'user_id' => $userId,
            'language' => 'id',
        ]);
        $this->getJson('/api/workspace')
            ->assertOk()
            ->assertJsonPath('profile.fullName', 'Ahmad Tibyan')
            ->assertJsonPath('profile.email', 'ahmad@example.test')
            ->assertJsonPath('savedJobs', []);
    }

    public function test_workspace_data_does_not_carry_over_between_accounts(): void
    {
        $first = $this->postJson('/api/auth/register', [
            'name' => 'Account One',
            'email' => 'one@example.test',
            'password' => 'safe-password-2026',
            'password_confirmation' => 'safe-password-2026',
        ])->assertCreated();
        $firstUserId = $first->json('user.id');

        $this->putJson('/api/workspace', [
            'profile' => [
                'fullName' => 'Account One',
                'email' => 'one@example.test',
                'targetRole' => 'Data Analyst',
                'location' => 'Bandung',
                'linkedin' => '',
                'skills' => ['SQL'],
            ],
            'preferences' => ['emailUpdates' => false, 'jobAlerts' => true, 'weeklyDigest' => false],
            'savedJobs' => [],
            'trackedJobs' => [],
            'completedMilestones' => [],
            'notifications' => [
                ['id' => 'notice-score', 'unread' => true],
                ['id' => 'notice-jobs', 'unread' => true],
                ['id' => 'notice-profile', 'unread' => false],
            ],
            'language' => 'id',
        ])->assertOk();

        $this->postJson('/api/auth/logout')->assertOk();
        $this->postJson('/api/auth/register', [
            'name' => 'Account Two',
            'email' => 'two@example.test',
            'password' => 'safe-password-2026',
            'password_confirmation' => 'safe-password-2026',
        ])->assertCreated();

        $this->getJson('/api/workspace')
            ->assertOk()
            ->assertJsonPath('profile.fullName', 'Account Two')
            ->assertJsonPath('profile.targetRole', 'Full Stack Developer')
            ->assertJsonPath('profile.skills', [])
            ->assertJsonPath('savedJobs', []);

        $this->assertDatabaseHas('career_workspaces', [
            'user_id' => $firstUserId,
            'profile->targetRole' => 'Data Analyst',
        ]);
    }
}
