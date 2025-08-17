<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')->constrained('appointments')->onDelete('cascade'); // NEW: Link to appointments
            $table->foreignId('order_id')->nullable()->constrained()->onDelete('cascade'); // Make nullable since we're using appointments
            $table->foreignId('rider_id')->nullable()->constrained()->onDelete('set null');
            $table->string('delivery_number')->unique();
            $table->string('status')->default('pending'); // pending, assigned, picked_up, in_transit, delivered, cancelled
            $table->text('pickup_address');
            $table->text('delivery_address');
            $table->decimal('distance_km', 8, 2)->nullable();
            $table->decimal('delivery_fee', 8, 2)->default(0);
            $table->decimal('rider_commission', 8, 2)->default(0); // NEW: Rider earnings from this delivery
            $table->timestamp('assigned_at')->nullable();
            $table->timestamp('picked_up_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('pickup_notes')->nullable();
            $table->text('delivery_notes')->nullable();
            $table->text('rider_notes')->nullable(); // NEW: Notes from rider
            $table->json('location_updates')->nullable(); // NEW: Track rider location updates
            $table->string('pickup_proof_image')->nullable(); // NEW: Image proof of pickup
            $table->string('delivery_proof_image')->nullable(); // NEW: Image proof of delivery
            $table->integer('customer_rating')->nullable();
            $table->text('customer_feedback')->nullable(); // NEW: Customer feedback about delivery
            $table->timestamps();

            // Add indexes
            $table->index('appointment_id');
            $table->index('rider_id');
            $table->index('status');
            $table->index('assigned_at');
        });
    }

    public function down()
    {
        Schema::dropIfExists('deliveries');
    }
};