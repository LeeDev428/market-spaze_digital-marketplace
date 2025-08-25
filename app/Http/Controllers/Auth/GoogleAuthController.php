<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;
use Exception;

class GoogleAuthController extends Controller
{
    /**
     * Redirect to Google OAuth page
     */
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle callback from Google
     */
    public function callback(): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->user();
            
            // Check if user already exists
            $user = User::where('email', $googleUser->getEmail())->first();
            
            if ($user) {
                // User exists, log them in
                Auth::login($user);
                
                // Mark email as verified since it's from Google
                if (!$user->hasVerifiedEmail()) {
                    $user->markEmailAsVerified();
                }
                
                // Redirect based on role
                return $this->getRedirectPath($user);
            } else {
                // Create new user
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'password' => Hash::make(uniqid()), // Random password since they'll use Google
                    'role' => 'customer', // Default to customer
                    'email_verified_at' => now(), // Mark as verified since it's from Google
                ]);
                
                event(new Registered($user));
                Auth::login($user);
                
                return redirect()->route('customer.dashboard')->with('success', 'Welcome to MarketSpaze! Your account has been created successfully.');
            }
            
        } catch (Exception $e) {
            return redirect()->route('login')->with('error', 'Something went wrong with Google authentication. Please try again.');
        }
    }
    
    /**
     * Get redirect path based on user role
     */
    private function getRedirectPath(User $user): RedirectResponse
    {
        switch ($user->role) {
            case 'customer':
                return redirect()->route('customer.dashboard');
            case 'vendor':
                return redirect()->route('vendor.dashboard');
            case 'rider':
                return redirect()->route('rider.dashboard');
            case 'admin':
                return redirect()->route('admin.dashboard');
            default:
                return redirect()->route('customer.dashboard');
        }
    }
}
