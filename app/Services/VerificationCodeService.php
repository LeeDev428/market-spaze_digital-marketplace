<?php

namespace App\Services;

use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Str;

class VerificationCodeService
{
    /**
     * Generate a 6-digit verification code and store in Redis
     */
    public function generateCode(string $email, string $type = 'email_verification', int $ttl = 300): string
    {
        // Generate 6-digit code
        $code = sprintf('%06d', mt_rand(100000, 999999));
        
        // Create Redis key
        $key = $this->getRedisKey($email, $type);
        
        // Store in Redis with TTL (5 minutes default)
        Redis::setex($key, $ttl, $code);
        
        // Optional: Store metadata
        $metaKey = $key . ':meta';
        $metadata = [
            'email' => $email,
            'type' => $type,
            'created_at' => now()->toISOString(),
            'attempts' => 0,
        ];
        Redis::setex($metaKey, $ttl, json_encode($metadata));
        
        return $code;
    }
    
    /**
     * Verify a code from Redis
     */
    public function verifyCode(string $email, string $code, string $type = 'email_verification'): bool
    {
        $key = $this->getRedisKey($email, $type);
        $metaKey = $key . ':meta';
        
        // Get stored code
        $storedCode = Redis::get($key);
        
        if (!$storedCode) {
            return false; // Code expired or doesn't exist
        }
        
        // Increment attempt counter
        $metadata = json_decode(Redis::get($metaKey), true) ?: [];
        $metadata['attempts'] = ($metadata['attempts'] ?? 0) + 1;
        
        // Check if too many attempts (security)
        if ($metadata['attempts'] > 5) {
            $this->deleteCode($email, $type);
            return false;
        }
        
        // Update metadata
        Redis::setex($metaKey, Redis::ttl($key), json_encode($metadata));
        
        // Verify code
        if ($storedCode === $code) {
            // Code is correct, remove it
            $this->deleteCode($email, $type);
            return true;
        }
        
        return false;
    }
    
    /**
     * Check if a code exists for the email/type
     */
    public function codeExists(string $email, string $type = 'email_verification'): bool
    {
        $key = $this->getRedisKey($email, $type);
        return Redis::exists($key) > 0;
    }
    
    /**
     * Get remaining TTL for a code
     */
    public function getRemainingTime(string $email, string $type = 'email_verification'): int
    {
        $key = $this->getRedisKey($email, $type);
        return Redis::ttl($key);
    }
    
    /**
     * Delete a verification code
     */
    public function deleteCode(string $email, string $type = 'email_verification'): bool
    {
        $key = $this->getRedisKey($email, $type);
        $metaKey = $key . ':meta';
        
        $deleted = Redis::del($key, $metaKey);
        return $deleted > 0;
    }
    
    /**
     * Get verification attempts
     */
    public function getAttempts(string $email, string $type = 'email_verification'): int
    {
        $metaKey = $this->getRedisKey($email, $type) . ':meta';
        $metadata = json_decode(Redis::get($metaKey), true) ?: [];
        return $metadata['attempts'] ?? 0;
    }
    
    /**
     * Generate Redis key for verification code
     */
    private function getRedisKey(string $email, string $type): string
    {
        return "verification_code:{$type}:" . hash('sha256', $email);
    }
    
    /**
     * Clean up expired codes (optional maintenance)
     */
    public function cleanupExpiredCodes(): int
    {
        // Redis automatically removes expired keys, but we can get stats
        $pattern = 'verification_code:*';
        $keys = Redis::keys($pattern);
        
        $expired = 0;
        foreach ($keys as $key) {
            if (Redis::ttl($key) <= 0) {
                Redis::del($key);
                $expired++;
            }
        }
        
        return $expired;
    }
}
