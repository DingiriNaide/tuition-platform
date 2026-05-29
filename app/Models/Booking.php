<?php

// app/Models/Booking.php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_profile_id',
        'course_id',
        'schedule_id',
        'status',
        'payment_status',
        'billing_type',
        'amount_due',
        'amount_paid',
        'start_date',
        'end_date',
        'notes',
        'cancellation_reason',
        'confirmed_at',
        'cancelled_at',
    ];

    protected $casts = [
        'start_date'    => 'date',
        'end_date'      => 'date',
        'confirmed_at'  => 'datetime',
        'cancelled_at'  => 'datetime',
        'amount_due'    => 'decimal:2',
        'amount_paid'   => 'decimal:2',
    ];

    // ── Relationships ────────────────────────────────────────────────

    public function studentProfile(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(BookingSession::class);
    }

    // ── Scopes ───────────────────────────────────────────────────────

    public function scopePending($query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where('status', 'pending');
    }

    public function scopeConfirmed($query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where('status', 'confirmed');
    }

    // ── Helpers ──────────────────────────────────────────────────────

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isConfirmed(): bool
    {
        return $this->status === 'confirmed';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    public function balanceDue(): float
    {
        return (float) $this->amount_due - (float) $this->amount_paid;
    }
}