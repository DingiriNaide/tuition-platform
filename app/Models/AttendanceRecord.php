<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_session_id',
        'booking_id',
        'student_profile_id',
        'tutor_profile_id',
        'status',
        'minutes_late',
        'tutor_notes',
        'marked_at',
    ];

    protected $casts = [
        'minutes_late' => 'integer',
        'marked_at'    => 'datetime',
    ];

    // ── Relationships ────────────────────────────────────────────────

    public function bookingSession(): BelongsTo
    {
        return $this->belongsTo(BookingSession::class);
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function studentProfile(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class);
    }

    public function tutorProfile(): BelongsTo
    {
        return $this->belongsTo(TutorProfile::class);
    }

    // ── Helpers ──────────────────────────────────────────────────────

    public static function statusOptions(): array
    {
        return [
            'present' => 'Present',
            'absent'  => 'Absent',
            'late'    => 'Late',
            'excused' => 'Excused',
        ];
    }

    public function isPresent(): bool
    {
        return in_array($this->status, ['present', 'late'], true);
    }
}
