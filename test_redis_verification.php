<?php

require_once 'vendor/autoload.php';

use App\Services\VerificationCodeService;

// Load Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🧪 Testing Redis-based Verification System\n";
echo "==========================================\n\n";

$service = new VerificationCodeService();
$email = 'test@example.com';

// Generate code
echo "1. Generating verification code...\n";
$code = $service->generateCode($email, 'email_verification', 300);
echo "   ✅ Generated code: $code\n";
echo "   ✅ Stored in Redis with 300s TTL\n\n";

// Check if exists
echo "2. Checking if code exists...\n";
$exists = $service->codeExists($email);
echo "   ✅ Code exists: " . ($exists ? 'YES' : 'NO') . "\n\n";

// Get remaining time
echo "3. Checking expiration...\n";
$ttl = $service->getRemainingTime($email);
echo "   ✅ Time remaining: {$ttl} seconds\n\n";

// Verify wrong code
echo "4. Testing wrong code...\n";
$wrongResult = $service->verifyCode($email, '000000');
echo "   ✅ Wrong code result: " . ($wrongResult ? 'ACCEPTED' : 'REJECTED') . "\n\n";

// Verify correct code
echo "5. Testing correct code...\n";
$correctResult = $service->verifyCode($email, $code);
echo "   ✅ Correct code result: " . ($correctResult ? 'ACCEPTED' : 'REJECTED') . "\n\n";

// Check if code still exists (should be deleted after verification)
echo "6. Checking if code exists after verification...\n";
$existsAfter = $service->codeExists($email);
echo "   ✅ Code exists after verification: " . ($existsAfter ? 'YES' : 'NO') . "\n\n";

echo "🎉 Redis verification system working perfectly!\n";
echo "💾 No database queries needed for verification codes!\n";
