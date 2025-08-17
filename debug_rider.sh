#!/bin/bash

# Test script to debug rider assignment issue

echo "🔍 DEBUGGING RIDER ASSIGNMENT ISSUE"
echo "=================================="
echo ""

# Check if Laravel is running
echo "📋 1. Checking Laravel Routes..."
php artisan route:list --name=rider.deliveries.accept | head -5

echo ""
echo "📊 2. Checking database connection..."
php artisan migrate:status | head -10

echo ""
echo "🧪 3. Checking current user data..."
php artisan tinker --execute="echo 'Users: ' . App\Models\User::count(); echo 'Riders: ' . App\Models\Rider::count(); echo 'Appointments: ' . App\Models\Appointment::count();"

echo ""
echo "🎯 4. Checking appointments with null rider_id..."
php artisan tinker --execute="echo 'Appointments with null rider_id: ' . App\Models\Appointment::whereNull('rider_id')->count();"

echo ""
echo "✅ Debugging complete!"
