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
            ->latest()
            ->take(6)
            ->get()
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