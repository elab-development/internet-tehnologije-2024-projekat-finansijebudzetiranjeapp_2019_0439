<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Auth\Events\PasswordReset;

class AuthController extends Controller
{
    /**
     * Registracija korisnika.
     */
    public function register(Request $request)
{
    try {
        $data = $request->validate([
            'name'                  => 'required|string|max:255',
            'email'                 => 'required|email|unique:users,email',
            'password'              => 'required|string|min:8|confirmed',
            'role'                  => 'nullable|string|in:user,admin,guest', // Dozvoljene uloge
        ]);

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => bcrypt($data['password']),
            'role'     => $data['role'] ?? 'user', // Default ako nije prosleđeno
        ]);

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ], 201);

    } catch (ValidationException $e) {
        return response()->json([
            'message' => 'Validation failed',
            'errors'  => $e->errors(),
        ], 422);

    } catch (\Throwable $e) {
        return response()->json([
            'message' => 'Registration error',
            'error'   => $e->getMessage(),
        ], 500);
    }
}

    /**
     * Login korisnika.
     */
    public function login(Request $request)
    {
        try {
            $data = $request->validate([
                'email'    => 'required|email',
                'password' => 'required|string',
            ]);

            $user = User::where('email', $data['email'])->first();

            if (! $user || ! Hash::check($data['password'], $user->password)) {
                return response()->json([
                    'message' => 'Invalid credentials'
                ], 401);
            }

            // obriši stare tokene (opciono)
            $user->tokens()->delete();

            $token = $user->createToken('api-token')->plainTextToken;

            return response()->json([
                'user'  => $user,
                'token' => $token,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Login error',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Logout korisnika (revoke token).
     */
    public function logout(Request $request)
{
    try {
        // obriši sve tokene ovog korisnika
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logged out'
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'message' => 'Logout error',
            'error'   => $e->getMessage(),
        ], 500);
    }
}
/**
     * 1) Pošalji password reset link na mejl
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        // Pošalji link; vraća status string
        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json(['message' => __($status)], 200);
        }

        return response()->json([
            'message' => __($status)
        ], 500);
    }

    /**
     * 2) Reset lozinke koristeći token
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email'                 => 'required|email|exists:users,email',
            'token'                 => 'required|string',
            'password'              => 'required|string|min:8|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email','password','password_confirmation','token'),
            function ($user, $password) {
                $user->password = bcrypt($password);
                $user->setRememberToken(Str::random(60));
                $user->save();

                // Opcionalno: obriši sve tokene ako koristiš Sanctum
                $user->tokens()->delete();

                event(new PasswordReset($user));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message'=>__($status)], 200);
        }

        return response()->json([
            'message'=>__($status)
        ], 500);
    }
}