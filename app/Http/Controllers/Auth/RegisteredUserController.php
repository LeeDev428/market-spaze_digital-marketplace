<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\VerificationCodeMail;
use App\Models\User;
use App\Services\VerificationCodeService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'user_type' => 'required|in:customer,vendor',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->user_type,
            // Don't set email_verified_at here - let them verify with code
        ]);

        // Generate and send 6-digit verification code using Redis
        $verificationService = new VerificationCodeService();
        $code = $verificationService->generateCode($request->email, 'email_verification');
        
        Mail::to($request->email)->send(
            new VerificationCodeMail($code, 'email_verification', $request->name)
        );

        event(new Registered($user));
        Auth::login($user);

        // Store email in session for verification page
        session(['email' => $request->email]);

        // Redirect to code verification page instead of verification notice
        return redirect()->route('verification.code.form');
    }
}
