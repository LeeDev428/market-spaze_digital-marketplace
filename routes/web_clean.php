<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
| Here is where you can register web routes for your application.
*/

// Default dashboard route that redirects based on role
Route::middleware(['auth', 'verified'])->get('/dashboard', function () {
    $user = Auth::user();
    
    // Check if user has roles using Spatie Laravel Permission
    if ($user->hasRole('admin')) {
        return redirect()->route('admin.dashboard');
    } elseif ($user->hasRole('vendor')) {
        return redirect()->route('vendor.dashboard');
    } elseif ($user->hasRole('customer')) {
        return redirect()->route('customer.dashboard');
    }
    
    // Default fallback
    return redirect()->route('customer.dashboard');
});

// Root route
Route::get('/', function () {
    return redirect('/register');
});

// Load other route groups
require __DIR__.'/public.php';
require __DIR__.'/debug.php';

// Load admin routes
require __DIR__.'/admin.php';

// Load vendor routes
require __DIR__.'/vendor.php';

// Load rider routes
require __DIR__.'/rider.php';
require __DIR__.'/customer.php';

// Load authentication routes
require __DIR__.'/auth.php';

// Load profile/settings routes (if you have them)
require __DIR__.'/settings.php';
