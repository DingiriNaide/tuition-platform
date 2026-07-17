<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Course extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $fillable = [
        'tutor_profile_id',
        'subject_id',
        'title',
        'title_sinhala',
        'title_tamil',
        'description',
        'description_sinhala',
        'description_tamil',
        'grade',
        'syllabus',
        'medium',
        'price_per_session',
        'price_monthly',
        'max_students',
        'is_group',
        'is_active',
    ];

    protected $casts = [
        'price_per_session' => 'decimal:2',
        'price_monthly'     => 'decimal:2',
        'max_students'      => 'integer',
        'is_group'          => 'boolean',
        'is_active'         => 'boolean',
    ];

    protected $appends = ['thumbnail_url'];

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('thumbnail')->singleFile();
    }

    public function getThumbnailUrlAttribute(): ?string
    {
        return $this->getFirstMediaUrl('thumbnail') ?: null;
    }

    // ── Relationships ────────────────────────────────────────────────

    public function tutorProfile(): BelongsTo
    {
        return $this->belongsTo(TutorProfile::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class);
    }

    public function bookings()
    {
        return $this->hasMany(\App\Models\Booking::class);
    }

    // ── Scopes ───────────────────────────────────────────────────────

    public function scopeActive($query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeForSyllabus($query, string $syllabus): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where('syllabus', $syllabus);
    }

    public function scopeForMedium($query, string $medium): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where('medium', $medium);
    }

    // ── Helpers ──────────────────────────────────────────────────────

    public static function gradeOptions(): array
    {
        return [
            'grade_6'    => 'Grade 6',
            'grade_7'    => 'Grade 7',
            'grade_8'    => 'Grade 8',
            'grade_9'    => 'Grade 9',
            'grade_10'   => 'Grade 10',
            'grade_11'   => 'Grade 11',
            'grade_12'   => 'Grade 12 (A/L Year 1)',
            'grade_13'   => 'Grade 13 (A/L Year 2)',
            'foundation' => 'Foundation',
        ];
    }

    public static function syllabusOptions(): array
    {
        return [
            'ol'         => 'O/L',
            'al'         => 'A/L',
            'foundation' => 'Foundation',
            'general'    => 'General',
        ];
    }

    public static function mediumOptions(): array
    {
        return [
            'sinhala'   => 'Sinhala',
            'tamil'     => 'Tamil',
            'english'   => 'English',
            'bilingual' => 'Bilingual',
        ];
    }
}