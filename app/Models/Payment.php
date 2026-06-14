<?php
// app/Models/Payment.php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'student_profile_id',
        'booking_session_id',
        'payhere_order_id',
        'payhere_payment_id',
        'amount',
        'currency',
        'status',
        'method',
        'gateway_response',
        'paid_at',
        'voucher_id',
        'discount_amount',
    ];

    protected $casts = [
        'amount'           => 'decimal:2',
        'discount_amount'  => 'decimal:2',
        'gateway_response' => 'array',
        'paid_at'          => 'datetime',
    ];

    // ─── Relationships ────────────────────────────────────────────────────────

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function studentProfile(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function generateOrderId(): string
    {
        return 'TP-' . strtoupper(uniqid()) . '-' . $this->booking_id;
    }
}
