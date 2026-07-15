<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class AssignmentSubmission extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $fillable = [
        'assignment_id', 'student_profile_id', 'text_answer', 'objective_answers',
        'auto_graded_score', 'final_score', 'tutor_feedback', 'status',
        'submitted_at', 'graded_at',
    ];

    protected $casts = [
        'objective_answers' => 'array',
        'submitted_at' => 'datetime',
        'graded_at' => 'datetime',
    ];

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class);
    }

    public function studentProfile(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('submission_files'); // student-uploaded homework files
    }
}