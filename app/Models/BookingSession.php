<?php

// app/Models/BookingSession.php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class BookingSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'schedule_id',
        'session_date',
        'start_time',
        'end_time',
        'status',
        'student_attended',
        'tutor_notes',
        'started_at',
        'ended_at',
    ];

    protected $casts = [
        'session_date'    => 'date',
        'student_attended'=> 'boolean',
        'started_at'      => 'datetime',
        'ended_at'        => 'datetime',
    ];

    // ── Relationships ────────────────────────────────────────────────

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class);
    }

    public function attendanceRecord(): HasOne
    {
        return $this->hasOne(AttendanceRecord::class);
    }

    public function bookingSession(): BelongsTo
    {
        return $this->belongsTo(BookingSession::class);
    }

    public function liveSession(): HasOne
    {
        return $this->hasOne(LiveSession::class);
    }

    // ── Helpers ──────────────────────────────────────────────────────

    public function durationMinutes(): int
    {
        $start = \Carbon\Carbon::parse($this->start_time);
        $end   = \Carbon\Carbon::parse($this->end_time);
        return (int) $start->diffInMinutes($end);
    }
}
