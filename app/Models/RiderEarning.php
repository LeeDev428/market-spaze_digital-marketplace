<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class RiderEarning extends Model
{
    use HasFactory;

    protected $fillable = [
        'rider_id',
        'appointment_id',
        'amount',
        'type',
        'description',
        'earned_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'earned_at' => 'datetime',
    ];

    // Relationships
    public function rider()
    {
        return $this->belongsTo(Rider::class);
    }

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    // Scopes
    public function scopeToday($query)
    {
        return $query->whereDate('earned_at', Carbon::today());
    }

    public function scopeThisWeek($query)
    {
        return $query->whereBetween('earned_at', [
            Carbon::now()->startOfWeek(),
            Carbon::now()->endOfWeek()
        ]);
    }

    public function scopeThisMonth($query)
    {
        return $query->whereMonth('earned_at', Carbon::now()->month)
                    ->whereYear('earned_at', Carbon::now()->year);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }
}