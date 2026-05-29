<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    protected $fillable = [
        'name', 'name_sinhala', 'name_tamil',
        'slug', 'syllabus', 'medium', 'is_active',
    ];

    public function tutors()
    {
        return $this->belongsToMany(TutorProfile::class, 'tutor_subject')
            ->withPivot('grade', 'rate_override', 'is_active')
            ->withTimestamps();
    }

    public function scopeActive($query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where('is_active', true);
    }

}