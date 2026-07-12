<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;

class Schedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'tutor_profile_id',
        'course_id',
        'day_of_week',
        'specific_date',
        'start_time',
        'end_time',
        'is_recurring',
        'recur_until',
        'max_students',
        'is_active',
    ];

    protected $casts = [
        'specific_date' => 'date',
        'recur_until'   => 'date',
        'is_recurring'  => 'boolean',
        'is_active'     => 'boolean',
    ];

    // ── Relationships ────────────────────────────────────────────────

    public function tutorProfile(): BelongsTo
    {
        return $this->belongsTo(TutorProfile::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function bookingSessions(): HasMany
    {
        return $this->hasMany(BookingSession::class);
    }

    // ── Scopes ───────────────────────────────────────────────────────

    public function scopeActive($query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where('is_active', true);
    }

    // ── Helpers ──────────────────────────────────────────────────────

    public static function dayOptions(): array
    {
        return [
            'monday'    => 'Monday',
            'tuesday'   => 'Tuesday',
            'wednesday' => 'Wednesday',
            'thursday'  => 'Thursday',
            'friday'    => 'Friday',
            'saturday'  => 'Saturday',
            'sunday'    => 'Sunday',
        ];
    }

    /**
     * Generate all concrete session dates from this schedule
     * between $from and $until (for calendar rendering / session generation).
     */
    public function occurrencesBetween(Carbon $from, Carbon $until): Collection
    {
        $dates = collect();

        if (!$this->is_recurring) {
            if ($this->specific_date
                && $this->specific_date->between($from, $until)) {
                $dates->push($this->specific_date->copy());
            }
            return $dates;
        }

        $dayMap = [
            'monday'    => Carbon::MONDAY,
            'tuesday'   => Carbon::TUESDAY,
            'wednesday' => Carbon::WEDNESDAY,
            'thursday'  => Carbon::THURSDAY,
            'friday'    => Carbon::FRIDAY,
            'saturday'  => Carbon::SATURDAY,
            'sunday'    => Carbon::SUNDAY,
        ];

        $targetDay = $dayMap[$this->day_of_week] ?? null;
        if ($targetDay === null) {
            return $dates;
        }

        $ceiling = $this->recur_until
            ? $until->min($this->recur_until)
            : $until;

        $cursor = $from->copy()->startOfDay();

        // Advance cursor to the first matching weekday
        while ($cursor->dayOfWeek !== $targetDay) {
            $cursor->addDay();
        }

        while ($cursor->lte($ceiling)) {
            $dates->push($cursor->copy());
            $cursor->addWeek();
        }

        return $dates;
    }
}