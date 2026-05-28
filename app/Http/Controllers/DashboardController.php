<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $role = $user->getRoleNames()->first();

        return match($role) {
            'student'     => $this->studentDashboard($user),
            'tutor'       => $this->tutorDashboard($user),
            'parent'      => $this->parentDashboard($user),
            'admin'       => $this->adminDashboard(),
            'super-admin' => $this->adminDashboard(),
            default       => Inertia::render('Dashboard/NoRole'),
        };
    }

    private function studentDashboard($user): Response
    {
        $profile = $user->studentProfile;

        return Inertia::render('Dashboard/Student', [
            'profile' => $profile,
            'stats'   => [
                'upcoming_classes' => 0,
                'completed_classes' => 0,
                'assignments_due' => 0,
            ],
        ]);
    }

    private function tutorDashboard($user): Response
    {
        $profile = $user->tutorProfile?->load('subjects');

        return Inertia::render('Dashboard/Tutor', [
            'profile' => $profile,
            'stats'   => [
                'total_students'   => 0,
                'upcoming_classes' => 0,
                'pending_reviews'  => 0,
                'monthly_earnings' => 0,
            ],
        ]);
    }

    private function parentDashboard($user): Response
    {
        $profile = $user->parentProfile;

        return Inertia::render('Dashboard/Parent', [
            'profile' => $profile,
            'stats'   => [
                'linked_students'  => 0,
                'upcoming_classes' => 0,
                'pending_payments' => 0,
            ],
        ]);
    }

    private function adminDashboard(): Response
    {
        return Inertia::render('Dashboard/Admin', [
            'stats' => [
                'total_students'        => \App\Models\StudentProfile::count(),
                'total_tutors'          => \App\Models\TutorProfile::count(),
                'pending_verifications' => \App\Models\TutorProfile::where('is_verified', false)->count(),
                'total_subjects'        => \App\Models\Subject::count(),
            ],
        ]);
    }
}