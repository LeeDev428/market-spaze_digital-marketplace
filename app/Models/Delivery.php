<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Delivery extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'rider_id',
        'delivery_number',
        'status',
        'pickup_address',
        'delivery_address',
        'distance_km',
        'delivery_fee',
        'assigned_at',
        'picked_up_at',
        'completed_at',
        'pickup_notes',
        'delivery_notes',
        'customer_rating',
    ];

    protected $casts = [
        'distance_km' => 'decimal:2',
        'delivery_fee' => 'decimal:2',
        'assigned_at' => 'datetime',
        'picked_up_at' => 'datetime',
        'completed_at' => 'datetime',
        'customer_rating' => 'integer',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function rider()
    {
        return $this->belongsTo(Rider::class);
    }
}