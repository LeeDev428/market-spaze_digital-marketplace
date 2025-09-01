<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\CodeVerificationController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\RiderRegisterController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('register', [RegisteredUserController::class, 'create'])
        ->name('register');

    Route::post('register', [RegisteredUserController::class, 'store']);

    // Rider registration routes
    Route::get('rider/register', [RiderRegisterController::class, 'create'])
        ->name('rider.register');

    Route::post('rider/register', [RiderRegisterController::class, 'store'])
        ->name('rider.register');

    Route::get('login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');

    Route::post('login', [AuthenticatedSessionController::class, 'store']);

    Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])
        ->name('password.request');

    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])
        ->name('password.email');

    Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])
        ->name('password.reset');

    Route::post('reset-password', [NewPasswordController::class, 'store'])
        ->name('password.store');
        
    // New code-based password reset routes
    Route::get('password-reset-form', [NewPasswordController::class, 'showResetForm'])
        ->name('password.reset.form');
        
    Route::post('password-reset-form', [NewPasswordController::class, 'updatePassword'])
        ->name('password.reset.update');
        
    // Google OAuth routes
    Route::get('auth/google', [GoogleController::class, 'redirectToGoogle'])
        ->name('google.redirect');
        
    Route::get('auth/google/callback', [GoogleController::class, 'handleGoogleCallback'])
        ->name('google.callback');
});

// 6-digit Code verification routes (accessible to both guest and auth users)
Route::get('verify-code', [CodeVerificationController::class, 'showVerificationForm'])
    ->name('verification.code.form');

Route::post('verify-code', [CodeVerificationController::class, 'verifyEmailCode'])
    ->name('verification.code.verify');

Route::post('resend-code', [CodeVerificationController::class, 'resendCode'])
    ->name('verification.code.resend');
    
Route::get('password-reset-code', [CodeVerificationController::class, 'showPasswordResetForm'])
    ->name('password.code.form');
    
Route::post('password-reset-code', [CodeVerificationController::class, 'verifyPasswordResetCode'])
    ->name('password.code.verify');

Route::middleware('auth')->group(function () {
    // Redirect old verification route to new code verification
    Route::get('verify-email', function() {
        return redirect()->route('verification.code.form');
    })->name('verification.notice');

    // Remove old email link verification - we use 6-digit codes now
    // Route::get('verify-email/{id}/{hash}', VerifyEmailController::class)
    //     ->middleware(['signed', 'throttle:6,1'])
    //     ->name('verification.verify');

    Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    Route::get('confirm-password', [ConfirmablePasswordController::class, 'show'])
        ->name('password.confirm');

    Route::post('confirm-password', [ConfirmablePasswordController::class, 'store']);

    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');
});
