<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\TutorProfile;
use App\Models\StudentProfile;
use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    public function index(): Response
    {
        $featuredCourses = Course::with(['subject', 'tutorProfile'])
            ->where('is_active', true)
            ->whereHas('tutorProfile', fn ($q) => $q->where('is_verified', true))
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->get()
            ->sortByDesc(function ($course) {
                $rating = (float) ($course->reviews_avg_rating ?? 0);
                $reviews = (int) $course->reviews_count;
                return ($rating * $reviews) / ($reviews + 5);
            })
            ->take(6)
            ->values()
            ->map(fn ($course) => [
                'id'                => $course->id,
                'title'             => $course->title,
                'subject'           => $course->subject->name,
                'tutor_name'        => $course->tutorProfile->full_name,
                'grade'             => $course->grade,
                'medium'            => $course->medium,
                'syllabus'          => $course->syllabus,
                'price_per_session' => $course->price_per_session,
                'price_monthly'     => $course->price_monthly,
                'is_group'          => $course->is_group,
                'rating'            => $course->reviews_avg_rating ? round((float) $course->reviews_avg_rating, 1) : null,
                'reviews_count'     => $course->reviews_count,
            ]);

        $stats = [
            'tutors'   => TutorProfile::where('is_verified', true)->count(),
            'courses'  => Course::where('is_active', true)->count(),
            'students' => StudentProfile::count(),
        ];

        return Inertia::render('landing', [
            'featuredCourses' => $featuredCourses,
            'stats'           => $stats,
        ]);
    }
}