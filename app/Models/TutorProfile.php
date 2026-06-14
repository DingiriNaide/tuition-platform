<?php

namespace App\Models;

use App\Models\Schedule;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TutorProfile extends Model
{

    protected $fillable = [
        'user_id', 'full_name', 'phone', 'nic_number',
        'city', 'district', 'bio', 'hourly_rate',
        'medium', 'is_verified', 'is_active', 'rating', 'total_reviews',
    ];

    // ── Relationships ────────────────────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function subjects()
    {
        return $this->belongsToMany(Subject::class, 'tutor_subject')
            ->withPivot('grade', 'rate_override', 'is_active')
            ->withTimestamps();
    }

    public function courses(): HasMany
    {
        return $this->hasMany(Course::class);
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }

    public function attendanceRecords(): HasMany
    {
        return $this->hasMany(AttendanceRecord::class);
    }

    public function progressReports(): HasMany
    {
        return $this->hasMany(ProgressReport::class);
    }

    public function payouts(): HasMany
    {
        return $this->hasMany(TutorPayout::class);
    }
}