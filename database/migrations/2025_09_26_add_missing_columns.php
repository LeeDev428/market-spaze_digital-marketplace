<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Add missing columns to vendor_stores table
        Schema::table('vendor_stores', function (Blueprint $table) {
            if (!Schema::hasColumn('vendor_stores', 'city')) {
                $table->string('city')->nullable()->after('address');
                $table->string('state')->nullable()->after('city');
                $table->string('zip_code')->nullable()->after('state');
                $table->boolean('is_verified')->default(false)->after('is_active');
                $table->string('response_time')->default('Within 24 hours')->after('is_verified');
            }
        });

        // Add missing columns to vendor_product_services table
        Schema::table('vendor_product_services', function (Blueprint $table) {
            if (!Schema::hasColumn('vendor_product_services', 'is_verified')) {
                $table->boolean('is_verified')->default(false)->after('is_professional');
            }
            
            // Update default values for existing boolean columns
            $table->boolean('is_guaranteed')->default(false)->change();
            $table->boolean('is_professional')->default(false)->change();
        });
    }

    public function down()
    {
        Schema::table('vendor_stores', function (Blueprint $table) {
            $table->dropColumn(['city', 'state', 'zip_code', 'is_verified', 'response_time']);
        });

        Schema::table('vendor_product_services', function (Blueprint $table) {
            $table->dropColumn('is_verified');
        });
    }
};