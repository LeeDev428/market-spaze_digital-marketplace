<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('rider_earnings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rider_id')->constrained()->onDelete('cascade');
            
            // ✅ REMOVED: delivery_id (deliveries table doesn't exist)
            // $table->foreignId('delivery_id')->nullable()->constrained()->onDelete('set null');
            
            $table->foreignId('appointment_id')->nullable()->constrained()->onDelete('set null');
            $table->decimal('amount', 10, 2);
            
            // ✅ IMPROVED: Better type options for your system
            $table->enum('type', [
                'delivery_fee',
                'service_commission', 
                'bonus',
                'tip',
                'penalty',
                'fuel_allowance',
                'completion_bonus'
            ])->default('delivery_fee');
            
            $table->text('description')->nullable();
            
            // ✅ ADDED: When the earning was actually earned (important for reporting)
            $table->timestamp('earned_at')->useCurrent();
            
            $table->timestamps();

            // ✅ IMPROVED: Better indexes for performance
            $table->index(['rider_id', 'earned_at']);
            $table->index(['appointment_id', 'type']);
            $table->index('type');
            $table->index('earned_at');
        });
    }

    public function down()
    {
        Schema::dropIfExists('rider_earnings');
    }
};