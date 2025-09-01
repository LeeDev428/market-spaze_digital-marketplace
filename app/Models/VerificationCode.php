<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class VerificationCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'email',
        'code',
        'type',
        'expires_at',
        'used',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'used' => 'boolean',
    ];

    /**
     * Generate a new 6-digit verification code
     */
    public static function generateCode(string $email, string $type): string
    {
        // Delete any existing unused codes for this email and type
        self::where('email', $email)
            ->where('type', $type)
            ->where('used', false)
            ->delete();

        // Generate 6-digit code
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Create new verification code (expires in 10 minutes)
        self::create([
            'email' => $email,
            'code' => $code,
            'type' => $type,
            'expires_at' => Carbon::now()->addMinutes(10),
            'used' => false,
        ]);

        return $code;
    }

    /**
     * Verify a code
     */
    public static function verifyCode(string $email, string $code, string $type): bool
    {
        $verificationCode = self::where('email', $email)
            ->where('code', $code)
            ->where('type', $type)
            ->where('used', false)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if ($verificationCode) {
            $verificationCode->update(['used' => true]);
            return true;
        }

        return false;
    }

    /**
     * Check if code is valid (not used and not expired)
     */
    public function isValid(): bool
    {
        return !$this->used && $this->expires_at->isFuture();
    }

    /**
     * Clean up expired codes (can be called in a scheduled job)
     */
    public static function cleanupExpired(): void
    {
        self::where('expires_at', '<', Carbon::now())->delete();
    }
}
