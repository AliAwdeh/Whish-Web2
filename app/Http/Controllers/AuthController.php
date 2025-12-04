<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Models\User;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'sometimes|in:user,agent',
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'] ?? 'user',
        ]);

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if (! $token = auth('api')->attempt($credentials)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        return response()->json([
            'user' => auth('api')->user(),
            'token' => $token,
        ]);
    }

    public function me()
    {
        return response()->json(auth('api')->user());
    }

    public function logout()
    {
        auth('api')->logout();

        return response()->json(['message' => 'Successfully logged out']);
    }

    public function refresh()
    {
        $newToken = auth('api')->refresh();

        return response()->json([
            'token' => $newToken,
        ]);
    }

    public function googleLogin(Request $request)
    {
        $request->validate([
            'id_token' => 'required|string',
        ]);

        $idToken = $request->id_token;

        $response = Http::get('https://oauth2.googleapis.com/tokeninfo', [
            'id_token' => $idToken,
        ]);

        if (! $response->ok()) {
            return response()->json(['message' => 'Invalid Google token'], 401);
        }

        $payload = $response->json();

        if (! isset($payload['aud']) || $payload['aud'] !== config('services.google.client_id')) {
            return response()->json(['message' => 'Invalid Google client'], 401);
        }

        $email = $payload['email'] ?? null;
        $name = $payload['name'] ?? null;

        if (! $email) {
            return response()->json(['message' => 'Google account has no email'], 400);
        }

        $user = User::where('email', $email)->first();

        if (! $user) {
            $user = User::create([
                'name' => $name ?: Str::before($email, '@'),
                'email' => $email,
                'password' => bcrypt(Str::random(32)),
                'role' => 'user',
            ]);
        }

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'user' => $user,
        ]);
    }

    public function githubLogin(Request $request)
    {
        $data = $request->validate([
            'access_token' => 'required|string',
        ]);

        $headers = [
            'Authorization' => 'Bearer ' . $data['access_token'],
            'Accept' => 'application/vnd.github+json',
            'User-Agent' => config('app.name', 'Laravel'),
        ];

        $userResponse = Http::withHeaders($headers)->get('https://api.github.com/user');

        if (! $userResponse->ok()) {
            return response()->json(['message' => 'Invalid GitHub token'], 401);
        }

        $githubUser = $userResponse->json();

        $email = $githubUser['email'] ?? null;

        if (! $email) {
            $emailResponse = Http::withHeaders($headers)->get('https://api.github.com/user/emails');

            if ($emailResponse->ok() && is_array($emailResponse->json())) {
                $emails = $emailResponse->json();
                $primaryVerified = null;
                $verified = null;
                $first = null;

                foreach ($emails as $emailEntry) {
                    if (! is_array($emailEntry) || empty($emailEntry['email'])) {
                        continue;
                    }

                    $first ??= $emailEntry['email'];

                    if (($emailEntry['verified'] ?? false) && $verified === null) {
                        $verified = $emailEntry['email'];
                    }

                    if (($emailEntry['primary'] ?? false) && ($emailEntry['verified'] ?? false)) {
                        $primaryVerified = $emailEntry['email'];
                        break;
                    }
                }

                $email = $primaryVerified ?? $verified ?? $first;
            }
        }

        if (! $email) {
            return response()->json(['message' => 'GitHub account has no accessible email'], 400);
        }

        $name = $githubUser['name'] ?? $githubUser['login'] ?? Str::before($email, '@');

        $user = User::where('email', $email)->first();

        if (! $user) {
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => bcrypt(Str::random(32)),
                'role' => 'user',
            ]);
        } elseif (! $user->role) {
            $user->forceFill(['role' => 'user'])->save();
        }

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'user' => $user,
        ]);
    }

    public function githubExchange(Request $request)
    {
        $data = $request->validate([
            'code' => 'required|string',
            'redirect_uri' => 'nullable|string',
        ]);

        $response = Http::asForm()
            ->acceptJson()
            ->post('https://github.com/login/oauth/access_token', [
                'client_id' => config('services.github.client_id'),
                'client_secret' => config('services.github.client_secret'),
                'code' => $data['code'],
                'redirect_uri' => $data['redirect_uri'] ?? config('services.github.redirect'),
            ]);

        if (! $response->ok() || empty($response['access_token'])) {
            return response()->json(['message' => 'GitHub code exchange failed'], 401);
        }

        return response()->json([
            'access_token' => $response['access_token'],
        ]);
    }
}
