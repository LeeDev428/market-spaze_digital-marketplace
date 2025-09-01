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
    } elseif ($user->hasRole('rider')) {
        return redirect()->route('rider.dashboard');
    } elseif ($user->hasRole('customer')) {
        return redirect()->route('customer.dashboard');
    }
    
    // Fallback: Check role property if roles aren't assigned yet
    $role = $user->role ?? 'customer';
    
    switch ($role) {
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
})->name('dashboard');

// Load public routes (always accessible)
require __DIR__.'/public.php';

// Load role-based route files
require __DIR__.'/admin.php';
require __DIR__.'/vendor.php';
require __DIR__.'/rider.php';
require __DIR__.'/customer.php';

// Load authentication routes
require __DIR__.'/auth.php';
require __DIR__.'/debug.php';
require __DIR__.'/test-history.php';

// Load profile/settings routes (if you have them)
require __DIR__.'/settings.php';

// History routes - accessible by all authenticated users
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/history', [\App\Http\Controllers\HistoryController::class, 'index'])->name('history.index');
    Route::get('/history/{appointment}', [\App\Http\Controllers\HistoryController::class, 'show'])->name('history.show');
});

// Test route for rider authentication
Route::get('/test-rider-auth', function () {
    return response()->json([
        'rider' => Auth::guard('rider')->user(),
        'guards' => config('auth.guards')
    ]);
});

// Debug route for rider dashboard data - bypassing auth for testing
Route::get('/debug-rider-dashboard-direct', function () {
    $rider = \App\Models\Rider::first(); // Get first rider directly
    if (!$rider) {
        return response()->json(['error' => 'No rider found in database']);
    }
    
    return response()->json([
        'rider_found' => true,
        'rider_id' => $rider->id,
        'rider_name' => $rider->name,
        'rider_email' => $rider->email,
        'rider_guard_check' => Auth::guard('rider')->check(),
        'web_guard_check' => Auth::guard('web')->check(),
        'config_auth_guards' => config('auth.guards'),
    ]);
});