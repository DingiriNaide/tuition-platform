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
            'stats'   => Inertia::defer(fn () => $this->studentStats($profile)),
            'pendingPaymentsCount'  => Inertia::defer(fn () => $this->studentPendingPaymentsCount($profile)),
            'pendingPaymentsAmount' => Inertia::defer(fn () => $this->studentPendingPaymentsAmount($profile)),
        ]);
    }

    private function studentStats($profile): array
    {
        $now = now()->timezone('Asia/Colombo')->toDateString();

        $stats = [
            'upcoming_classes'  => 0,
            'completed_classes' => 0,
            'attended_sessions' => 0,
        ];

        if ($profile) {
            $stats['upcoming_classes'] = \App\Models\BookingSession::whereHas('booking', fn($q) =>
                    $q->where('student_profile_id', $profile->id)
                    ->whereIn('status', ['pending', 'confirmed'])
                )
                ->where('status', 'scheduled')
                ->where('session_date', '>=', $now)
                ->count();

            $stats['completed_classes'] = \App\Models\BookingSession::whereHas('booking', fn($q) =>
                    $q->where('student_profile_id', $profile->id)
                )
                ->where('status', 'completed')
                ->count();

            $stats['attended_sessions'] = \App\Models\BookingSession::whereHas('booking', fn($q) =>
                    $q->where('student_profile_id', $profile->id)
                )
                ->where('student_attended', true)
                ->count();
        }

        return $stats;
    }

    private function studentPendingPaymentsCount($profile): int
    {
        if (!$profile) return 0;

        return \App\Models\Payment::where('student_profile_id', $profile->id)
            ->where('status', 'pending')
            ->count();
    }

    private function studentPendingPaymentsAmount($profile): float
    {
        if (!$profile) return 0;

        return \App\Models\Payment::where('student_profile_id', $profile->id)
            ->where('status', 'pending')
            ->sum('amount');
    }

    private function tutorDashboard($user): Response
    {
        $profile = $user->tutorProfile?->load('subjects');

        return Inertia::render('Dashboard/Tutor', [
            'profile'        => $profile,
            'stats'          => Inertia::defer(fn () => $this->tutorStats($profile)),
            'pendingPayouts' => Inertia::defer(fn () => $this->tutorPendingPayouts($profile)),
            'totalEarnings'  => Inertia::defer(fn () => $this->tutorTotalEarnings($profile)),
        ]);
    }

    private function tutorStats($profile): array
    {
        $now = now()->timezone('Asia/Colombo')->toDateString();

        $stats = [
            'total_students'   => 0,
            'upcoming_classes' => 0,
            'pending_reviews'  => 0,
            'active_courses'   => 0,
        ];

        if ($profile) {
            $stats['total_students'] = \App\Models\Booking::whereHas('course', fn($q) =>
                    $q->where('tutor_profile_id', $profile->id)
                )
                ->whereIn('status', ['pending', 'confirmed'])
                ->distinct('student_profile_id')
                ->count('student_profile_id');

            $stats['upcoming_classes'] = \App\Models\BookingSession::whereHas('booking.course', fn($q) =>
                    $q->where('tutor_profile_id', $profile->id)
                )
                ->where('status', 'scheduled')
                ->where('session_date', '>=', $now)
                ->count();

            $stats['pending_reviews'] = \App\Models\Booking::whereHas('course', fn($q) =>
                    $q->where('tutor_profile_id', $profile->id)
                )
                ->where('status', 'confirmed')
                ->whereDoesntHave('progressReports')
                ->count();

            $stats['active_courses'] = \App\Models\Course::where('tutor_profile_id', $profile->id)
                ->where('is_active', true)
                ->count();
        }

        return $stats;
    }

    private function tutorPendingPayouts($profile): float
    {
        if (!$profile) return 0;

        return (float) \App\Models\TutorPayout::where('tutor_profile_id', $profile->id)
            ->where('status', 'pending')
            ->sum('net_amount');
    }

    private function tutorTotalEarnings($profile): float
    {
        if (!$profile) return 0;

        return (float) \App\Models\TutorPayout::where('tutor_profile_id', $profile->id)
            ->where('status', 'paid')
            ->sum('net_amount');
    }

    private function parentDashboard($user): Response
    {
        $profile = $user->parentProfile;

        return Inertia::render('Dashboard/Parent', [
            'profile' => $profile,
            'stats'   => Inertia::defer(fn () => $this->parentStats($profile)),
        ]);
    }

    private function parentStats($profile): array
{
    $stats = [
        'linked_students'  => 0,
        'upcoming_classes' => 0,
        'pending_payments' => 0,
    ];

    if ($profile) {
        $stats['linked_students']  = $profile->students()->count();
        
        $stats['upcoming_classes'] = \App\Models\BookingSession::whereHas('booking.studentProfile', fn($q) => 
                $q->where('parent_id', $profile->id)
            )
            ->where('status', 'scheduled')
            ->where('session_date', '>=', now()->timezone('Asia/Colombo')->toDateString())
            ->count();
            
        $stats['pending_payments'] = \App\Models\Payment::whereHas('studentProfile', fn($q) => 
                $q->where('parent_id', $profile->id)
            )
            ->where('status', 'pending')
            ->count();
    }

    return $stats;
}

    private function adminDashboard(): Response
    {
        return Inertia::render('Dashboard/Admin', [
            'stats' => Inertia::defer(fn () => $this->adminStats()),
        ]);
    }

    private function adminStats(): array
    {
        return [
            'total_students'        => \App\Models\StudentProfile::count(),
            'total_tutors'          => \App\Models\TutorProfile::count(),
            'pending_verifications' => \App\Models\TutorProfile::where('is_verified', false)->count(),
            'total_subjects'        => \App\Models\Subject::count(),
            'active_courses'        => \App\Models\Course::where('is_active', true)->count(),
            'total_bookings'        => \App\Models\Booking::whereIn('status', ['pending', 'confirmed'])->count(),
            'todays_sessions'       => \App\Models\BookingSession::whereDate('session_date', today())->count(),
            'total_revenue'         => (float) \App\Models\Payment::where('status', 'completed')->sum('amount'),
        ];
    }
}