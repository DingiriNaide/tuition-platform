<?php

// app/Models/ProgressReport.php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProgressReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'student_profile_id',
        'tutor_profile_id',
        'course_id',
        'overall_grade',
        'score',
        'strengths',
        'areas_for_improvement',
        'tutor_comments',
        'recommended_actions',
        'period_start',
        'period_end',
        'total_sessions',
        'attended_sessions',
        'absent_sessions',
        'late_sessions',
        'is_published',
        'published_at',
    ];

    protected $casts = [
        'period_start'      => 'date',
        'period_end'        => 'date',
        'published_at'      => 'datetime',
        'is_published'      => 'boolean',
        'total_sessions'    => 'integer',
        'attended_sessions' => 'integer',
        'absent_sessions'   => 'integer',
        'late_sessions'     => 'integer',
        'score'             => 'integer',
    ];

    // ── Relationships ────────────────────────────────────────────────

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

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    // ── Helpers ──────────────────────────────────────────────────────

    public static function gradeOptions(): array
    {
        return [
            'excellent'    => 'Excellent (90–100)',
            'good'         => 'Good (75–89)',
            'satisfactory' => 'Satisfactory (60–74)',
            'needs_work'   => 'Needs Work (45–59)',
            'poor'         => 'Poor (below 45)',
        ];
    }

    public static function gradeColors(): array
    {
        return [
            'excellent'    => 'green',
            'good'         => 'blue',
            'satisfactory' => 'yellow',
            'needs_work'   => 'orange',
            'poor'         => 'red',
        ];
    }

    public function attendancePercentage(): float
    {
        if ($this->total_sessions === 0) {
            return 0.0;
        }

        return round(($this->attended_sessions / $this->total_sessions) * 100, 1);
    }
}
