<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationPromptController extends Controller
{
    /**
     * Show the email verification prompt page.
     */
    public function __invoke(Request $request): Response|RedirectResponse
    {
        // Get user from appropriate guard
        $user = $request->user() ?: Auth::guard('rider')->user();
        
        if ($user && $user->hasVerifiedEmail()) {
            // Redirect based on user role after verification
            
            if ($user->role === 'customer') {
                return redirect()->intended(route('customer.dashboard'));
            } elseif ($user->role === 'vendor') {
                return redirect()->intended(route('vendor.dashboard'));
            } elseif ($user->role === 'rider') {
                return redirect()->intended(route('rider.dashboard'));
            }
            
            return redirect()->intended(route('dashboard', absolute: false));
        }
        
        return Inertia::render('auth/verify-email', ['status' => $request->session()->get('status')]);
    }
}
