<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {
        $user = $request->user();
        
        if ($user->hasVerifiedEmail()) {
            return $this->getRedirectPath($user, true);
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return $this->getRedirectPath($user, true);
    }
    
    /**
     * Get the redirect path based on user role
     */
    private function getRedirectPath($user, bool $verified = false): RedirectResponse
    {
        $verifiedParam = $verified ? '?verified=1' : '';
        
        switch ($user->role) {
            case 'customer':
                return redirect()->intended(route('customer.dashboard') . $verifiedParam);
            case 'vendor':
                return redirect()->intended(route('vendor.dashboard') . $verifiedParam);
            case 'rider':
                return redirect()->intended(route('rider.dashboard') . $verifiedParam);
            default:
                return redirect()->intended(route('dashboard', absolute: false) . $verifiedParam);
        }
    }
}
