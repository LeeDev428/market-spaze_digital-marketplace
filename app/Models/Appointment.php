<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;
use App\Models\VendorProductService;
use App\Models\Rider;

class Appointment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'appointment_number',
        'user_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'customer_address',
        'customer_city',
        'emergency_contact_name',
        'emergency_contact_phone',
        'vendor_store_id',
        'service_id',
        'rider_id', // ← This is now available
        'appointment_date',
        'appointment_time',
        'estimated_end_time',
        'duration_minutes',
        'service_price',
        'additional_charges',
        'discount_amount',
        'total_amount',
        'currency',
        'requirements',
        'customer_notes',
        'internal_notes',
        'status',
        'cancellation_reason',
        'cancellation_details',
        'confirmed_at',
        'started_at',
        'completed_at',
        'cancelled_at',
        'rescheduled_at',
        'sms_notifications',
        'email_notifications',
        'reminder_sent_at',
        'notification_log',
        'customer_rating',
        'customer_feedback',
        'feedback_submitted_at',
        'payment_status',
        'payment_method',
        'payment_reference',
        'payment_completed_at',
        'is_home_service',
        'service_address',
        'weather_conditions',
    ];

    protected $casts = [
        'appointment_date' => 'date',
        'appointment_time' => 'datetime:H:i',
        'estimated_end_time' => 'datetime:H:i',
        'service_price' => 'decimal:2',
        'additional_charges' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'requirements' => 'array',
        'notification_log' => 'array',
        'confirmed_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'rescheduled_at' => 'datetime',
        'reminder_sent_at' => 'datetime',
        'feedback_submitted_at' => 'datetime',
        'payment_completed_at' => 'datetime',
        'sms_notifications' => 'boolean',
        'email_notifications' => 'boolean',
        'is_home_service' => 'boolean',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function vendorStore()
    {
        return $this->belongsTo(VendorStore::class);
    }

    public function service()
    {
        return $this->belongsTo(VendorProductService::class, 'service_id');
    }

    // Alias for service relationship (for backwards compatibility)
    public function vendorProductService()
    {
        return $this->belongsTo(VendorProductService::class, 'service_id');
    }

    // ✅ Add this relationship
    public function rider()
    {
        return $this->belongsTo(Rider::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['pending', 'confirmed', 'in_progress']);
    }

    public function scopeAvailableForRiders($query)
    {
        return $query->where('status', 'confirmed')
                    ->whereNull('rider_id')
                    ->whereDate('appointment_date', '>=', now());
    }

    public function scopeForRider($query, $riderId)
    {
        return $query->where('rider_id', $riderId);
    }
}