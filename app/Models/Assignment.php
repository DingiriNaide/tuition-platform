<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Assignment extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $fillable = [
        'course_id', 'tutor_profile_id', 'booking_id', 'title', 'description',
        'type', 'questions', 'total_marks', 'due_date', 'is_published',
    ];

    protected $casts = [
        'questions' => 'array',
        'due_date' => 'datetime',
        'is_published' => 'boolean',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function tutorProfile(): BelongsTo
    {
        return $this->belongsTo(TutorProfile::class);
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(AssignmentSubmission::class);
    }

    public function isCourseWide(): bool
    {
        return is_null($this->booking_id);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('attachments'); // tutor-uploaded assignment files
    }
}