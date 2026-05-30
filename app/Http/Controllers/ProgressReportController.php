<?php

// app/Http/Controllers/ProgressReportController.php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\AttendanceRecord;
use App\Models\Booking;
use App\Models\ProgressReport;
use App\Models\StudentProfile;
use App\Models\TutorProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProgressReportController extends Controller
{
    /**
     * Tutor: list reports they have written.
     * GET /progress-reports
     */
    public function index(): Response|RedirectResponse
    {
        $tutorProfile = TutorProfile::where('user_id', Auth::id())->first();

        if (!$tutorProfile) {
            return redirect()->route('tutor.profile.create');
        }

        $reports = ProgressReport::with(['studentProfile', 'course.subject'])
            ->where('tutor_profile_id', $tutorProfile->id)
            ->orderByDesc('period_end')
            ->paginate(15);

        return Inertia::render('ProgressReports/Index', [
            'reports' => [
                'data'         => $reports->items(),
                'total'        => $reports->total(),
                'current_page' => $reports->currentPage(),
                'last_page'    => $reports->lastPage(),
                'links'        => $reports->linkCollection()->toArray(),
            ],
            'gradeOptions' => ProgressReport::gradeOptions(),
            'gradeColors'  => ProgressReport::gradeColors(),
        ]);
    }

    /**
     * Tutor: report creation form for a specific booking.
     * GET /bookings/{booking}/progress-reports/create
     */
    public function create(Booking $booking): Response|RedirectResponse
    {
        $tutorProfile = TutorProfile::where('user_id', Auth::id())->firstOrFail();

        $booking->load(['course.subject', 'studentProfile', 'sessions.attendanceRecord']);

        abort_unless($booking->course->tutor_profile_id === $tutorProfile->id, 403);

        // Auto-calculate attendance stats for the report period
        $completedSessions = $booking->sessions->where('status', 'completed');
        $attendedCount     = $completedSessions->where('student_attended', true)->count();
        $absentCount       = $completedSessions->where('student_attended', false)->count();
        $lateCount         = $completedSessions
            ->filter(fn ($s) => $s->attendanceRecord?->status === 'late')
            ->count();

        $firstSession = $booking->sessions->where('status', 'completed')->sortBy('session_date')->first();
        $lastSession  = $booking->sessions->where('status', 'completed')->sortByDesc('session_date')->first();

        return Inertia::render('ProgressReports/Create', [
            'booking'      => $booking,
            'gradeOptions' => ProgressReport::gradeOptions(),
            'defaults'     => [
                'total_sessions'    => $completedSessions->count(),
                'attended_sessions' => $attendedCount,
                'absent_sessions'   => $absentCount,
                'late_sessions'     => $lateCount,
                'period_start'      => $firstSession?->session_date?->toDateString()
                                       ?? $booking->start_date->toDateString(),
                'period_end'        => $lastSession?->session_date?->toDateString()
                                       ?? now()->timezone('Asia/Colombo')->toDateString(),
            ],
        ]);
    }

    /**
     * Tutor: store report.
     * POST /bookings/{booking}/progress-reports
     */
    public function store(Request $request, Booking $booking): RedirectResponse
    {
        $tutorProfile = TutorProfile::where('user_id', Auth::id())->firstOrFail();

        $booking->load('course');

        abort_unless($booking->course->tutor_profile_id === $tutorProfile->id, 403);

        $validated = $request->validate([
            'overall_grade'          => ['required', 'in:' . implode(',', array_keys(ProgressReport::gradeOptions()))],
            'score'                  => ['nullable', 'integer', 'min:0', 'max:100'],
            'strengths'              => ['nullable', 'string', 'max:2000'],
            'areas_for_improvement'  => ['nullable', 'string', 'max:2000'],
            'tutor_comments'         => ['nullable', 'string', 'max:3000'],
            'recommended_actions'    => ['nullable', 'string', 'max:2000'],
            'period_start'           => ['required', 'date'],
            'period_end'             => ['required', 'date', 'after_or_equal:period_start'],
            'total_sessions'         => ['required', 'integer', 'min:0'],
            'attended_sessions'      => ['required', 'integer', 'min:0'],
            'absent_sessions'        => ['required', 'integer', 'min:0'],
            'late_sessions'          => ['required', 'integer', 'min:0'],
            'is_published'           => ['required', 'boolean'],
        ]);

        $report = ProgressReport::create([
            ...$validated,
            'booking_id'         => $booking->id,
            'student_profile_id' => $booking->student_profile_id,
            'tutor_profile_id'   => $tutorProfile->id,
            'course_id'          => $booking->course_id,
            'published_at'       => $validated['is_published']
                ? now()->timezone('Asia/Colombo')
                : null,
        ]);

        return redirect()
            ->action([ProgressReportController::class, 'show'], $report)
            ->with('success', $validated['is_published']
                ? 'Progress report published and visible to student.'
                : 'Progress report saved as draft.');
    }

    /**
     * Show a single report — tutor, student, parent, or admin.
     * GET /progress-reports/{progressReport}
     */
    public function show(ProgressReport $progressReport): Response|RedirectResponse
    {
        $this->authorizeView($progressReport);

        $progressReport->load([
            'course.subject',
            'studentProfile',
            'tutorProfile',
            'booking',
        ]);

        return Inertia::render('ProgressReports/Show', [
            'report'       => $progressReport,
            'gradeOptions' => ProgressReport::gradeOptions(),
            'gradeColors'  => ProgressReport::gradeColors(),
        ]);
    }

    /**
     * Tutor: edit form.
     * GET /progress-reports/{progressReport}/edit
     */
    public function edit(ProgressReport $progressReport): Response|RedirectResponse
    {
        $tutorProfile = TutorProfile::where('user_id', Auth::id())->firstOrFail();
        abort_unless($progressReport->tutor_profile_id === $tutorProfile->id, 403);

        $progressReport->load(['course.subject', 'studentProfile', 'booking']);

        return Inertia::render('ProgressReports/Edit', [
            'report'       => $progressReport,
            'gradeOptions' => ProgressReport::gradeOptions(),
        ]);
    }

    /**
     * Tutor: update.
     * PUT /progress-reports/{progressReport}
     */
    public function update(Request $request, ProgressReport $progressReport): RedirectResponse
    {
        $tutorProfile = TutorProfile::where('user_id', Auth::id())->firstOrFail();
        abort_unless($progressReport->tutor_profile_id === $tutorProfile->id, 403);

        $validated = $request->validate([
            'overall_grade'          => ['required', 'in:' . implode(',', array_keys(ProgressReport::gradeOptions()))],
            'score'                  => ['nullable', 'integer', 'min:0', 'max:100'],
            'strengths'              => ['nullable', 'string', 'max:2000'],
            'areas_for_improvement'  => ['nullable', 'string', 'max:2000'],
            'tutor_comments'         => ['nullable', 'string', 'max:3000'],
            'recommended_actions'    => ['nullable', 'string', 'max:2000'],
            'period_start'           => ['required', 'date'],
            'period_end'             => ['required', 'date', 'after_or_equal:period_start'],
            'total_sessions'         => ['required', 'integer', 'min:0'],
            'attended_sessions'      => ['required', 'integer', 'min:0'],
            'absent_sessions'        => ['required', 'integer', 'min:0'],
            'late_sessions'          => ['required', 'integer', 'min:0'],
            'is_published'           => ['required', 'boolean'],
        ]);

        // Set published_at only on first publish
        if ($validated['is_published'] && !$progressReport->is_published) {
            $validated['published_at'] = now()->timezone('Asia/Colombo');
        }

        $progressReport->update($validated);

        return redirect()
            ->action([ProgressReportController::class, 'show'], $progressReport)
            ->with('success', 'Progress report updated.');
    }

    /**
     * Student: all their progress reports.
     * GET /my-progress
     */
    public function studentReports(): Response|RedirectResponse
    {
        $studentProfile = StudentProfile::where('user_id', Auth::id())->first();

        if (!$studentProfile) {
            return redirect()->route('student.profile.create');
        }

        $reports = ProgressReport::with(['course.subject', 'tutorProfile'])
            ->where('student_profile_id', $studentProfile->id)
            ->where('is_published', true)
            ->orderByDesc('period_end')
            ->paginate(10);

        return Inertia::render('ProgressReports/StudentIndex', [
            'reports' => [
                'data'         => $reports->items(),
                'total'        => $reports->total(),
                'current_page' => $reports->currentPage(),
                'last_page'    => $reports->lastPage(),
                'links'        => $reports->linkCollection()->toArray(),
            ],
            'gradeOptions' => ProgressReport::gradeOptions(),
            'gradeColors'  => ProgressReport::gradeColors(),
        ]);
    }

    // ── Private ──────────────────────────────────────────────────────

    private function authorizeView(ProgressReport $report): void
    {
        $user = Auth::user();

        $isTutor   = TutorProfile::where('user_id', $user->id)
                        ->where('id', $report->tutor_profile_id)
                        ->exists();

        $isStudent = StudentProfile::where('user_id', $user->id)
                        ->where('id', $report->student_profile_id)
                        ->exists()
                     && $report->is_published;

        $isAdmin   = $user->hasAnyRole(['admin', 'super-admin']);

        abort_unless($isTutor || $isStudent || $isAdmin, 403);
    }
}
