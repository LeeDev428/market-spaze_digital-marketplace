<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('riders', function (Blueprint $table) {
            $table->id();
            
            // ✅ AUTHENTICATION FIELDS - Make riders independent users
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            
            // ✅ RIDER SPECIFIC FIELDS
            $table->string('rider_id')->unique();
            $table->string('phone')->nullable();
            
            // ✅ FIXED: Changed from 'motorcycle' to 'Motorcycle' to match your code
            $table->string('vehicle_type')->default('Motorcycle');
            
            // ✅ ADDED: License number (your code expects this)
            $table->string('license_number')->nullable();
            
            // ✅ REMOVED: license_plate (not used in your code)
            // $table->string('license_plate');
            
            // ✅ FIXED: Made it enum to match your code expectations
            $table->enum('status', ['offline', 'available', 'busy'])->default('offline');
            
            $table->decimal('rating', 3, 2)->default(5.00);
            $table->integer('total_deliveries')->default(0);
            
            // ✅ ADDED: Verification status (important for rider approval)
            $table->boolean('is_verified')->default(false);
            
            // ✅ ADDED: Account activation status for admin control
            $table->boolean('is_activated')->default(true);
            
            $table->boolean('is_online')->default(false);
            $table->decimal('current_latitude', 10, 8)->nullable();
            $table->decimal('current_longitude', 11, 8)->nullable();
            
            // ✅ REMOVED: earnings columns (should be in separate earnings table)
            // $table->decimal('earnings_today', 10, 2)->default(0);
            // $table->decimal('earnings_total', 10, 2)->default(0);
            
            // ✅ FIXED: Better naming for location coordinates
            $table->decimal('location_lat', 10, 8)->nullable();
            $table->decimal('location_lng', 11, 8)->nullable();
            
            $table->timestamps();
            
            // ✅ ADDED: Important indexes for performance
            $table->index(['status', 'is_verified']);
            $table->index('location_lat');
            $table->index('location_lng');
            $table->index('email'); // For login lookups
        });
    }

    public function down()
    {
        Schema::dropIfExists('riders');
    }
};