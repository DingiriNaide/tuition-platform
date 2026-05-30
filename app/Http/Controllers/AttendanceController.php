<?php

// app/Http/Controllers/AttendanceController.php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\AttendanceRecord;
use App\Models\Booking;
use App\Models\BookingSession;
use App\Models\StudentProfile;
use App\Models\TutorProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    /**
     * Tutor marks attendance for all students in a session.
     * GET /attendance/{bookingSession}/mark
     */
    public function mark(BookingSession $bookingSession): Response|RedirectResponse
    {
        $tutorProfile = TutorProfile::where('user_id', Auth::id())->first();

        abort_unless($tutorProfile, 403);

        // Verify tutor owns this session via booking → course
        $bookingSession->load([
            'booking.course.subject',
            'booking.course.tutorProfile',
            'booking.studentProfile',
            'attendanceRecord',
        ]);

        abort_unless(
            $bookingSession->booking->course->tutorProfile->id === $tutorProfile->id,
            403
        );

        abort_unless(
            in_array($bookingSession->status, ['scheduled', 'ongoing', 'completed'], true),
            422
        );

        return Inertia::render('Attendance/Mark', [
            'session'         => $bookingSession,
            'booking'         => $bookingSession->booking->load('studentProfile'),
            'existingRecord'  => $bookingSession->attendanceRecord,
            'statusOptions'   => AttendanceRecord::statusOptions(),
        ]);
    }

    /**
     * Tutor submits attendance for a session.
     * POST /attendance/{bookingSession}
     */
    public function store(Request $request, BookingSession $bookingSession): RedirectResponse
    {
        $tutorProfile = TutorProfile::where('user_id', Auth::id())->firstOrFail();

        $bookingSession->load('booking.course.tutorProfile');

        abort_unless(
            $bookingSession->booking->course->tutorProfile->id === $tutorProfile->id,
            403
        );

        $validated = $request->validate([
            'status'       => ['required', 'in:present,absent,late,excused'],
            'minutes_late' => ['required_if:status,late', 'nullable', 'integer', 'min:1', 'max:120'],
            'tutor_notes'  => ['nullable', 'string', 'max:500'],
        ]);

        DB::transaction(function () use ($validated, $bookingSession, $tutorProfile): void {
            AttendanceRecord::updateOrCreate(
                ['booking_session_id' => $bookingSession->id],
                [
                    'booking_id'         => $bookingSession->booking_id,
                    'student_profile_id' => $bookingSession->booking->student_profile_id,
                    'tutor_profile_id'   => $tutorProfile->id,
                    'status'             => $validated['status'],
                    'minutes_late'       => $validated['minutes_late'] ?? 0,
                    'tutor_notes'        => $validated['tutor_notes'] ?? null,
                    'marked_at'          => now()->timezone('Asia/Colombo'),
                ]
            );

            // Update session status and student_attended flag
            $bookingSession->update([
                'status'           => 'completed',
                'student_attended' => in_array($validated['status'], ['present', 'late'], true),
            ]);
        });

        return redirect()
            ->action([BookingController::class, 'show'], $bookingSession->booking_id)
            ->with('success', 'Attendance marked successfully.');
    }

    /**
     * Tutor views attendance roster for a booking (all sessions).
     * GET /bookings/{booking}/attendance
     */
    public function bookingRoster(Booking $booking): Response|RedirectResponse
    {
        $tutorProfile = TutorProfile::where('user_id', Auth::id())->first();
        $studentProfile = StudentProfile::where('user_id', Auth::id())->first();

        // Both tutor owner and the student can view
        $isTutorOwner = $tutorProfile &&
            $tutorProfile->id === $booking->course->tutorProfile->id ?? false;

        $isStudent = $studentProfile &&
            $studentProfile->id === $booking->student_profile_id;

        $isAdmin = Auth::user()->hasAnyRole(['admin', 'super-admin']);

        abort_unless($isTutorOwner || $isStudent || $isAdmin, 403);

        $booking->load([
            'course.subject',
            'course.tutorProfile',
            'studentProfile',
            'sessions' => fn ($q) => $q->orderBy('session_date')->orderBy('start_time'),
            'sessions.attendanceRecord',
        ]);

        // Aggregate stats
        $totalSessions    = $booking->sessions->count();
        $completedCount   = $booking->sessions->where('status', 'completed')->count();
        $attendedCount    = $booking->sessions->where('student_attended', true)->count();
        $absentCount      = $booking->sessions
            ->where('status', 'completed')
            ->where('student_attended', false)
            ->count();
        $lateCount        = $booking->sessions
            ->filter(fn ($s) => $s->attendanceRecord?->status === 'late')
            ->count();

        return Inertia::render('Attendance/BookingRoster', [
            'booking'        => $booking,
            'isTutorOwner'   => $isTutorOwner,
            'stats'          => [
                'total_sessions'    => $totalSessions,
                'completed'         => $completedCount,
                'attended'          => $attendedCount,
                'absent'            => $absentCount,
                'late'              => $lateCount,
                'attendance_rate'   => $totalSessions > 0
                    ? round(($attendedCount / max($completedCount, 1)) * 100, 1)
                    : 0,
            ],
            'statusOptions'  => AttendanceRecord::statusOptions(),
        ]);
    }

    /**
     * Student views their own attendance summary across all bookings.
     * GET /attendance
     */
    public function studentSummary(): Response|RedirectResponse
    {
        $studentProfile = StudentProfile::where('user_id', Auth::id())->first();

        if (!$studentProfile) {
            return redirect()->route('student.profile.create');
        }

        $records = AttendanceRecord::with([
                'bookingSession',
                'booking.course.subject',
                'booking.course.tutorProfile',
            ])
            ->where('student_profile_id', $studentProfile->id)
            ->orderByDesc('marked_at')
            ->paginate(20);

        // Per-course attendance summary
        $courseSummary = AttendanceRecord::select(
                'booking_id',
                DB::raw('COUNT(*) as total'),
                DB::raw("SUM(CASE WHEN status IN ('present','late') THEN 1 ELSE 0 END) as attended"),
                DB::raw("SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent"),
                DB::raw("SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late"),
                DB::raw("SUM(CASE WHEN status = 'excused' THEN 1 ELSE 0 END) as excused")
            )
            ->where('student_profile_id', $studentProfile->id)
            ->groupBy('booking_id')
            ->with('booking.course.subject', 'booking.course.tutorProfile')
            ->get();

        return Inertia::render('Attendance/StudentSummary', [
            'records' => [
                'data'         => $records->items(),
                'total'        => $records->total(),
                'current_page' => $records->currentPage(),
                'last_page'    => $records->lastPage(),
                'links'        => $records->linkCollection()->toArray(),
            ],
            'courseSummary'  => $courseSummary,
            'statusOptions'  => AttendanceRecord::statusOptions(),
        ]);
    }
}
