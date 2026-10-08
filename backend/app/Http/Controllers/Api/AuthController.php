<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\CareerWorkspaceDefaults;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function csrf()
    {
        return response()->json(['token' => csrf_token()]);
    }

    public function me(Request $request)
    {
        return response()->json(['user' => $request->user()->only(['id', 'name', 'email'])]);
    }

    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:100'],
            'email' => ['required', 'email:rfc', 'max:180', 'unique:users,email'],
            'password' => ['required', 'string', 'min:10', 'confirmed'],
        ]);

        $user = DB::transaction(function () use ($data): User {
            $user = User::create([
                'name' => trim($data['name']),
                'email' => mb_strtolower(trim($data['email'])),
                'password' => $data['password'],
            ]);
            $defaults = CareerWorkspaceDefaults::forUser($user->name, $user->email);
            DB::table('career_workspaces')->insert([
                'user_id' => $user->id,
                'profile' => json_encode($defaults['profile'], JSON_UNESCAPED_UNICODE),
                'preferences' => json_encode($defaults['preferences']),
                'notifications' => json_encode($defaults['notifications'], JSON_UNESCAPED_UNICODE),
                'saved_jobs' => json_encode($defaults['saved_jobs']),
                'tracked_jobs' => json_encode($defaults['tracked_jobs']),
                'completed_milestones' => json_encode($defaults['completed_milestones']),
                'language' => $defaults['language'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return $user;
        });

        Auth::login($user);
        $request->session()->regenerate();

        return response()->json(['user' => $user->only(['id', 'name', 'email'])], 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email:rfc'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt(['email' => mb_strtolower(trim($credentials['email'])), 'password' => $credentials['password']], $request->boolean('remember'))) {
            return response()->json(['message' => 'Email atau kata sandi tidak cocok.'], 422);
        }

        $request->session()->regenerate();

        return response()->json(['user' => $request->user()->only(['id', 'name', 'email'])]);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['loggedOut' => true]);
    }

    public function testEmail(Request $request)
    {
        $user = $request->user();
        $mailer = (string) config('mail.default');

        try {
            Mail::raw('Email uji Careerly berhasil diproses. Jika MAIL_MAILER=log, pesan tersimpan di log Laravel; gunakan SMTP untuk menerima email di kotak masuk.', function ($message) use ($user): void {
                $message->to($user->email)->subject('Uji pengiriman email Careerly');
            });
        } catch (\Throwable) {
            return response()->json(['message' => 'Email gagal diproses. Periksa konfigurasi SMTP di backend.'], 422);
        }

        return response()->json([
            'sent' => true,
            'mailer' => $mailer,
            'message' => $mailer === 'log'
                ? 'Email uji tercatat di log Laravel. Atur MAIL_MAILER=smtp agar masuk ke kotak email.'
                : 'Permintaan email uji berhasil dikirim ke layanan email.',
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $data = $request->validate(['email' => ['required', 'email:rfc']]);

        try {
            $status = Password::sendResetLink(['email' => mb_strtolower(trim($data['email']))]);
            if ($status !== Password::RESET_LINK_SENT) {
                logger()->notice('Password reset link was not sent.', ['status' => $status]);
            }
        } catch (\Throwable $exception) {
            logger()->warning('Password reset email delivery failed.', ['type' => $exception::class]);
        }

        return response()->json(['message' => 'Jika alamat email terdaftar, instruksi pemulihan akan dikirim.']);
    }

    public function resetPassword(Request $request)
    {
        $data = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email:rfc'],
            'password' => ['required', 'string', 'min:10', 'confirmed'],
        ]);

        $status = Password::reset(
            ['email' => mb_strtolower(trim($data['email'])), 'password' => $data['password'], 'password_confirmation' => $data['password_confirmation'], 'token' => $data['token']],
            function (User $user, string $password): void {
                $user->forceFill(['password' => Hash::make($password), 'remember_token' => Str::random(60)])->save();
                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Tautan pemulihan tidak valid atau sudah kedaluwarsa.'], 422);
        }

        return response()->json(['message' => 'Kata sandi berhasil diperbarui.']);
    }
}
