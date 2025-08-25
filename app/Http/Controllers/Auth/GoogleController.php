<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;

class GoogleController extends Controller
{
    /**
     * Redirect to Google OAuth provider
     */
    public function redirectToGoogle(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle Google OAuth callback
     */
    public function handleGoogleCallback(): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->user();
            
            // Check if user already exists with this Google ID
            $existingUser = User::where('google_id', $googleUser->getId())->first();
            
            if ($existingUser) {
                // User exists with Google ID, log them in
                Auth::login($existingUser);
                return $this->redirectBasedOnRole($existingUser);
            }
            
            // Check if user exists with this email
            $userWithEmail = User::where('email', $googleUser->getEmail())->first();
            
            if ($userWithEmail) {
                // User exists with email but no Google ID, link the accounts
                $userWithEmail->update([
                    'google_id' => $googleUser->getId(),
                    'email_verified_at' => now(), // Mark email as verified since Google verified it
                ]);
                
                Auth::login($userWithEmail);
                return $this->redirectBasedOnRole($userWithEmail);
            }
            
            // Create new user
            $newUser = User::create([
                'name' => $googleUser->getName(),
                'email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
                'email_verified_at' => now(), // Mark email as verified since Google verified it
                'password' => null, // No password for OAuth users
                'role' => 'customer', // Default role
            ]);
            
            Auth::login($newUser);
            return $this->redirectBasedOnRole($newUser);
            
        } catch (\Exception $e) {
            return redirect()->route('login')->with('error', 'Google authentication failed. Please try again.');
        }
    }

    /**
     * Redirect user based on their role
     */
    private function redirectBasedOnRole(User $user): RedirectResponse
    {
        switch ($user->role) {
            case 'admin':
                return redirect()->route('admin.dashboard');
            case 'vendor':
                return redirect()->route('vendor.dashboard');
            case 'rider':
                return redirect()->route('rider.dashboard');
            case 'customer':
            default:
                return redirect()->route('customer.dashboard');
        }
    }
}
