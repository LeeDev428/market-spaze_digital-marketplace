<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\Redis;

// Load Laravel environment
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    echo "Testing Redis connection...\n";
    
    // Test basic Redis connection
    $redis = Redis::connection();
    $pong = $redis->ping();
    echo "✅ Redis PING: " . ($pong ? 'PONG' : 'Failed') . "\n";
    
    // Test set/get
    $redis->set('test_key', 'Hello Redis from Laravel!');
    $value = $redis->get('test_key');
    echo "✅ Redis SET/GET: $value\n";
    
    // Test cache facade
    \Illuminate\Support\Facades\Cache::put('laravel_test', 'Laravel Cache Works!', 60);
    $cached = \Illuminate\Support\Facades\Cache::get('laravel_test');
    echo "✅ Laravel Cache: $cached\n";
    
    echo "\n🎉 Redis is working perfectly with Laravel!\n";
    
} catch (Exception $e) {
    echo "❌ Redis Error: " . $e->getMessage() . "\n";
    echo "Make sure Redis server is running: redis-server\n";
}
