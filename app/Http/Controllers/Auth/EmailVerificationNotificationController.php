<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\VerificationCodeMail;
use App\Services\VerificationCodeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class EmailVerificationNotificationController extends Controller
{
    /**
     * Send a new email verification code (6-digit).
     */
    public function store(Request $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended(route('dashboard', absolute: false));
        }

        $user = $request->user();
        
        // Generate and send 6-digit verification code instead of email link using Redis
        $verificationService = new VerificationCodeService();
        $code = $verificationService->generateCode($user->email, 'email_verification');
        
        Mail::to($user->email)->send(
            new VerificationCodeMail($code, 'email_verification', $user->name)
        );

        return back()->with('status', 'verification-code-sent');
    }
}
