<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

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

    public function attendanceRecords(): HasMany
    {
        return $this->hasMany(AttendanceRecord::class);
    }

    public function progressReports(): HasMany
    {
        return $this->hasMany(ProgressReport::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function latestPayment(): HasOne
    {
        return $this->hasOne(Payment::class)->latestOfMany();
    }

    public function hasPendingPayment(): bool
    {
        return $this->payments()->where('status', 'pending')->exists();
    }

    public function isPaid(): bool
    {
        return $this->payment_status === 'paid';
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

    public function recalculatePaymentStatus(): void
    {
        if ($this->amount_due <= 0) {
            $status = 'unpaid';
        } elseif ($this->amount_paid >= $this->amount_due) {
            $status = 'paid';
        } elseif ($this->amount_paid > 0) {
            $status = 'partial';
        } else {
            $status = 'unpaid';
        }

        $this->update(['payment_status' => $status]);
    }
}