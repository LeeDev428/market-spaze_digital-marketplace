<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationPromptController extends Controller
{
    /**
     * Show the email verification prompt page.
     */
    public function __invoke(Request $request): Response|RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            // Redirect based on user role after verification
            $user = $request->user();
            
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
