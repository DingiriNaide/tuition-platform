<?php

// app/Models/LiveSession.php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class LiveSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_session_id',
        'course_id',
        'tutor_profile_id',
        'channel_name',
        'status',
        'started_at',
        'ended_at',
        'peak_participants',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'ended_at'   => 'datetime',
    ];

    // ── Relationships ────────────────────────────────────────────────

    public function bookingSession(): BelongsTo
    {
        return $this->belongsTo(BookingSession::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function tutorProfile(): BelongsTo
    {
        return $this->belongsTo(TutorProfile::class);
    }

    // ── Helpers ──────────────────────────────────────────────────────

    public static function generateChannelName(): string
    {
        return Str::lower(Str::random(12));
    }

    public function isLive(): bool
    {
        return $this->status === 'live';
    }

    public function isWaiting(): bool
    {
        return $this->status === 'waiting';
    }

    public function durationMinutes(): int
    {
        if (!$this->started_at || !$this->ended_at) {
            return 0;
        }

        return (int) $this->started_at->diffInMinutes($this->ended_at);
    }
}
