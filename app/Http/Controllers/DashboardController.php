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

        $pendingPaymentsCount  = 0;
        $pendingPaymentsAmount = 0;

        if ($profile) {
            $pendingPaymentsCount  = \App\Models\Payment::where('student_profile_id', $profile->id)
                ->where('status', 'pending')
                ->count();

            $pendingPaymentsAmount = \App\Models\Payment::where('student_profile_id', $profile->id)
                ->where('status', 'pending')
                ->sum('amount');
        }

        return Inertia::render('Dashboard/Student', [
            'profile' => $profile,
            'stats'   => [
                'upcoming_classes'  => 0,
                'completed_classes' => 0,
                'assignments_due'   => 0,
            ],
            'pendingPaymentsCount'  => $pendingPaymentsCount,
            'pendingPaymentsAmount' => $pendingPaymentsAmount,
        ]);
    }

    private function tutorDashboard($user): Response
    {
        $profile = $user->tutorProfile?->load('subjects');

        $pendingPayouts = 0;
        $totalEarnings  = 0;

        if ($profile) {
            $pendingPayouts = \App\Models\TutorPayout::where('tutor_profile_id', $profile->id)
                ->where('status', 'pending')
                ->sum('net_amount');

            $totalEarnings = \App\Models\TutorPayout::where('tutor_profile_id', $profile->id)
                ->where('status', 'paid')
                ->sum('net_amount');
        }

        return Inertia::render('Dashboard/Tutor', [
            'profile' => $profile,
            'stats'   => [
                'total_students'   => 0,
                'upcoming_classes' => 0,
                'pending_reviews'  => 0,
                'monthly_earnings' => 0,
            ],
            'pendingPayouts' => $pendingPayouts,
            'totalEarnings'  => $totalEarnings,
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