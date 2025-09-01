<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\VerificationCodeMail;
use App\Models\User;
use App\Services\VerificationCodeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    /**
     * Show the password reset link request page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming password reset link request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        // Check if user exists
        $user = User::where('email', $request->email)->first();
        
        if ($user) {
            // Generate and send 6-digit verification code for password reset using Redis
            $verificationService = new VerificationCodeService();
            $code = $verificationService->generateCode($request->email, 'password_reset');
            
            Mail::to($request->email)->send(
                new VerificationCodeMail($code, 'password_reset', $user->name)
            );
            
            // Store email in session for the verification page
            $request->session()->put('password_reset_email', $request->email);
            
            return redirect()->route('password.code.form')->with('status', 'A 6-digit password reset code has been sent to your email.');
        }

        // For security, don't reveal if email exists or not
        return back()->with('status', 'If an account with that email exists, a 6-digit reset code will be sent.');
    }
}
