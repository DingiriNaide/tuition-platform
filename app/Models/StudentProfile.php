<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StudentProfile extends Model
{

    protected $fillable = [
        'user_id', 'full_name', 'date_of_birth', 'gender',
        'phone', 'school', 'grade', 'medium',
        'district', 'city', 'is_low_income',
    ];

    // ── Relationships ────────────────────────────────────────────────
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function attendanceRecords(): HasMany
    {
        return $this->hasMany(AttendanceRecord::class);
    }

    public function progressReports(): HasMany
    {
        return $this->hasMany(ProgressReport::class);
    }
}