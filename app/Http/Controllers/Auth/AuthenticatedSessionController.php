<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
            'resend_verification' => $request->session()->get('resend_verification'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $userType = $request->input('user_type');
        
        // Get the user from the appropriate guard
        if ($userType === 'rider') {
            $user = Auth::guard('rider')->user();
        } else {
            $user = $request->user();
        }
        
        // Check if email is verified (only for users that implement MustVerifyEmail)
        if ($user && method_exists($user, 'hasVerifiedEmail') && !$user->hasVerifiedEmail()) {
            // Logout from the appropriate guard
            if ($userType === 'rider') {
                Auth::guard('rider')->logout();
            } else {
                Auth::logout();
            }
            return redirect()->route('login')->withErrors([
                'email' => 'You must verify your email address before you can login. Please check your email for a verification link.',
            ])->with('resend_verification', true);
        }

        $request->session()->regenerate();

        // Redirect based on user type
        switch ($userType) {
            case 'admin':
                return redirect()->intended(route('admin.dashboard'));
            case 'vendor':
                return redirect()->intended(route('vendor.dashboard'));
            case 'rider':
                return redirect()->intended(route('rider.dashboard'));
            case 'customer':
            default:
                return redirect()->intended(route('customer.dashboard'));
        }
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        // Logout from both guards
        Auth::guard('web')->logout();
        Auth::guard('rider')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
