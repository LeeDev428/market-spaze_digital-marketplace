<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\VerificationCodeMail;
use App\Models\User;
use App\Services\VerificationCodeService;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class CodeVerificationController extends Controller
{
    /**
     * Show the code verification form
     */
    public function showVerificationForm(Request $request)
    {
        $email = $request->session()->get('email') ?? $request->query('email') ?? Auth::user()?->email;
        
        if (!$email) {
            return redirect()->route('login')->with('error', 'Email address is required for verification.');
        }
        
        return Inertia::render('auth/verify-code', [
            'email' => $email,
            'type' => 'email_verification'
        ]);
    }

    /**
     * Verify the 6-digit code for email verification
     */
    public function verifyEmailCode(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => 'required|string|size:6',
            'email' => 'required|email',
        ]);

        // Use Redis service to verify code
        $verificationService = new VerificationCodeService();
        $isValid = $verificationService->verifyCode(
            $request->email,
            $request->code,
            'email_verification'
        );

        if (!$isValid) {
            return back()->withErrors([
                'code' => 'Invalid or expired verification code.'
            ]);
        }

        // Find and verify the user
        $user = User::where('email', $request->email)->first();
        
        if ($user && !$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            event(new Verified($user));
        }

        // Redirect based on user role
        if ($user) {
            switch ($user->role) {
                case 'customer':
                    return redirect()->route('customer.dashboard')->with('success', 'Email verified successfully!');
                case 'vendor':
                    return redirect()->route('vendor.dashboard')->with('success', 'Email verified successfully!');
                case 'rider':
                    return redirect()->route('rider.dashboard')->with('success', 'Email verified successfully!');
                default:
                    return redirect()->route('dashboard')->with('success', 'Email verified successfully!');
            }
        }

        return redirect()->route('login')->with('success', 'Email verified successfully! Please log in.');
    }

    /**
     * Resend verification code
     */
    public function resendCode(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $request->email)->first();
        
        if ($user && $user->hasVerifiedEmail()) {
            return back()->with('info', 'Email is already verified.');
        }

        // Generate and send new code using Redis
        $verificationService = new VerificationCodeService();
        $code = $verificationService->generateCode($request->email, 'email_verification');
        
        Mail::to($request->email)->send(
            new VerificationCodeMail($code, 'email_verification', $user?->name)
        );

        return back()->with('status', 'A new verification code has been sent to your email.');
    }

    /**
     * Show password reset code form
     */
    public function showPasswordResetForm(Request $request)
    {
        $email = $request->session()->get('password_reset_email');
        
        if (!$email) {
            return redirect()->route('password.request');
        }

        return Inertia::render('auth/verify-code', [
            'email' => $email,
            'type' => 'password_reset'
        ]);
    }

    /**
     * Verify password reset code
     */
    public function verifyPasswordResetCode(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => 'required|string|size:6',
            'email' => 'required|email',
        ]);

        // Use Redis service to verify code
        $verificationService = new VerificationCodeService();
        $isValid = $verificationService->verifyCode(
            $request->email,
            $request->code,
            'password_reset'
        );

        if (!$isValid) {
            return back()->withErrors([
                'code' => 'Invalid or expired verification code.'
            ]);
        }

        // Store verification in session and redirect to password reset form
        $request->session()->put([
            'email' => $request->email,
            'code_verified' => true
        ]);
        
        return redirect()->route('password.reset.form');
    }
}
