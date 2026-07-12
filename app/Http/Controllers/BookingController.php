<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\BookingSession;
use App\Models\Course;
use App\Models\Schedule;
use App\Models\StudentProfile;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    // ── Student: my bookings ─────────────────────────────────────────

    public function index(): Response|RedirectResponse
    {
        $studentProfile = StudentProfile::where('user_id', Auth::id())->first();

        if (!$studentProfile) {
            return redirect()->route('student.profile.create');
        }

        $bookings = Booking::with([
                'course.subject',
                'course.tutorProfile',
                'schedule',
                'sessions' => fn ($q) => $q->orderBy('session_date')->orderBy('start_time'),
            ])
            ->where('student_profile_id', $studentProfile->id)
            ->latest()
            ->paginate(10);

        return Inertia::render('Bookings/Index', [
            'bookings' => [
                'data'         => $bookings->items(),
                'total'        => $bookings->total(),
                'current_page' => $bookings->currentPage(),
                'last_page'    => $bookings->lastPage(),
                'links'        => $bookings->linkCollection()->toArray(),
            ],
        ]);
    }

    // ── Student: booking form for a course ───────────────────────────

    public function create(Request $request): Response|RedirectResponse
    {
        $studentProfile = StudentProfile::where('user_id', Auth::id())->first();

        if (!$studentProfile) {
            return redirect()->route('student.profile.create');
        }

        $course = Course::with(['tutorProfile', 'subject'])
            ->where('is_active', true)
            ->findOrFail($request->query('course_id'));

        // Load active schedules for this course with booking counts
        $schedules = Schedule::with('bookings')
            ->where('course_id', $course->id)
            ->where('is_active', true)
            ->get()
            ->map(function (Schedule $schedule) use ($course): array {
                $confirmedCount = $schedule->bookings()
                    ->whereIn('status', ['pending', 'confirmed'])
                    ->count();

                $maxStudents = $schedule->max_students ?? $course->max_students;

                return [
                    'id'             => $schedule->id,
                    'day_of_week'    => $schedule->day_of_week,
                    'specific_date'  => $schedule->specific_date?->toDateString(),
                    'start_time'     => $schedule->start_time,
                    'end_time'       => $schedule->end_time,
                    'is_recurring'   => $schedule->is_recurring,
                    'recur_until'    => $schedule->recur_until?->toDateString(),
                    'max_students'   => $maxStudents,
                    'spots_taken'    => $confirmedCount,
                    'spots_left'     => max(0, $maxStudents - $confirmedCount),
                    'is_full'        => $confirmedCount >= $maxStudents,
                ];
            });

        return Inertia::render('Bookings/Create', [
            'course'    => $course,
            'schedules' => $schedules,
            'dayOptions'=> Schedule::dayOptions(),
        ]);
    }

    // ── Student: store booking ───────────────────────────────────────

    public function store(Request $request): RedirectResponse
    {
        $studentProfile = StudentProfile::where('user_id', Auth::id())->firstOrFail();

        $validated = $request->validate([
            'course_id'    => ['required', 'exists:courses,id'],
            'schedule_id'  => ['required', 'exists:schedules,id'],
            'billing_type' => ['required', 'in:per_session,monthly'],
            'start_date'   => ['required', 'date', 'after_or_equal:today'],
            'notes'        => ['nullable', 'string', 'max:1000'],
        ]);

        $course   = Course::where('is_active', true)->findOrFail($validated['course_id']);
        $schedule = Schedule::where('course_id', $course->id)
                            ->where('is_active', true)
                            ->findOrFail($validated['schedule_id']);

        // Check capacity
        $confirmedCount = $schedule->bookings()
            ->whereIn('status', ['pending', 'confirmed'])
            ->count();

        $maxStudents = $schedule->max_students ?? $course->max_students;

        if ($confirmedCount >= $maxStudents) {
            return back()->with('error', 'This schedule is fully booked.');
        }

        // Prevent duplicate active bookings
        $alreadyBooked = Booking::where('student_profile_id', $studentProfile->id)
            ->where('schedule_id', $schedule->id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->exists();

        if ($alreadyBooked) {
            return back()->with('error', 'You already have an active booking for this schedule.');
        }

        $startDate    = Carbon::parse($validated['start_date'])->timezone('Asia/Colombo');
        $sessionCount = count($schedule->occurrencesBetween($startDate, $startDate->copy()->addWeeks(4)));

        $amountDue = $validated['billing_type'] === 'monthly'
            ? (float) ($course->price_monthly ?? 0)
            : 0.0; // will increment as sessions are attended

        DB::transaction(function () use (
            $validated, $studentProfile, $course, $schedule, $amountDue, $startDate
        ): void {
            $booking = Booking::create([
                'student_profile_id' => $studentProfile->id,
                'course_id'          => $course->id,
                'schedule_id'        => $schedule->id,
                'status'             => 'pending',
                'payment_status'     => 'unpaid',
                'billing_type'       => $validated['billing_type'],
                'amount_due'         => $amountDue,
                'amount_paid'        => 0,
                'start_date'         => $startDate->toDateString(),
                'notes'              => $validated['notes'] ?? null,
            ]);

            $this->generateSessions($booking, $schedule, $startDate);
        });

        return redirect()
            ->action([BookingController::class, 'index'])
            ->with('success', 'Booking submitted. Awaiting tutor confirmation.');
    }

    // ── Shared: show booking ─────────────────────────────────────────

    public function show(Booking $booking): Response|RedirectResponse
    {
        $this->authorizeView($booking);

        $booking->load([
            'course.subject',
            'course.tutorProfile',
            'schedule',
            'studentProfile',
            'sessions' => fn ($q) => $q->orderBy('session_date')->orderBy('start_time'),
            'sessions.attendanceRecord',
            'sessions.liveSession',
        ]);

        return Inertia::render('Bookings/Show', [
            'booking'    => $booking,
            'dayOptions' => Schedule::dayOptions(),
        ]);
    }

    // ── Student: cancel booking ──────────────────────────────────────

    public function cancel(Request $request, Booking $booking): RedirectResponse
    {
        $studentProfile = StudentProfile::where('user_id', Auth::id())->firstOrFail();

        abort_unless($booking->student_profile_id === $studentProfile->id, 403);
        abort_unless($booking->isPending() || $booking->isConfirmed(), 422);

        $validated = $request->validate([
            'cancellation_reason' => ['nullable', 'string', 'max:500'],
        ]);

        $booking->update([
            'status'              => 'cancelled',
            'cancelled_at'        => now()->timezone('Asia/Colombo'),
            'cancellation_reason' => $validated['cancellation_reason'] ?? null,
        ]);

        // Cancel all future scheduled sessions
        $booking->sessions()
            ->where('status', 'scheduled')
            ->where('session_date', '>=', now()->timezone('Asia/Colombo')->toDateString())
            ->update(['status' => 'cancelled']);

        return redirect()
            ->action([BookingController::class, 'index'])
            ->with('success', 'Booking cancelled.');
    }

    // ── Tutor: confirm booking ───────────────────────────────────────

    public function confirm(Booking $booking): RedirectResponse
    {
        $tutorProfile = $booking->course->tutorProfile;

        abort_unless(
            $tutorProfile->user_id === Auth::id(),
            403
        );
        abort_unless($booking->isPending(), 422);

        $booking->update([
            'status'       => 'confirmed',
            'confirmed_at' => now()->timezone('Asia/Colombo'),
        ]);

        return back()->with('success', 'Booking confirmed.');
    }

    // ── Tutor: list bookings for their courses ───────────────────────

    public function tutorBookings(): Response|RedirectResponse
    {
        $user = Auth::user();

        $tutorProfile = \App\Models\TutorProfile::where('user_id', $user->id)->first();

        if (!$tutorProfile) {
            return redirect()->route('tutor.profile.create');
        }

        $bookings = Booking::with([
                'course.subject',
                'schedule',
                'studentProfile',
            ])
            ->whereHas('course', fn ($q) => $q->where('tutor_profile_id', $tutorProfile->id))
            ->latest()
            ->paginate(15);

        return Inertia::render('Bookings/TutorIndex', [
            'bookings' => [
                'data'         => $bookings->items(),
                'total'        => $bookings->total(),
                'current_page' => $bookings->currentPage(),
                'last_page'    => $bookings->lastPage(),
                'links'        => $bookings->linkCollection()->toArray(),
            ],
        ]);
    }

    // ── Private ──────────────────────────────────────────────────────

    private function authorizeView(Booking $booking): void
    {
        $user = Auth::user();

        $isStudent = StudentProfile::where('user_id', $user->id)
            ->where('id', $booking->student_profile_id)
            ->exists();

        $isTutorOwner = $booking->course->tutorProfile->user_id === $user->id;

        $isAdmin = $user->hasAnyRole(['admin', 'super-admin']);

        abort_unless($isStudent || $isTutorOwner || $isAdmin, 403);
    }

    private function generateSessions(
        Booking  $booking,
        Schedule $schedule,
        Carbon   $startDate
    ): void {
        $timezone = 'Asia/Colombo';
        $from     = $startDate->copy()->timezone($timezone);
        $until    = $from->copy()->addWeeks(4);

        $occurrences = $schedule->occurrencesBetween($from, $until);

        foreach ($occurrences as $date) {
            BookingSession::create([
                'booking_id'   => $booking->id,
                'schedule_id'  => $schedule->id,
                'session_date' => $date->toDateString(),
                'start_time'   => $schedule->start_time,
                'end_time'     => $schedule->end_time,
                'status'       => 'scheduled',
            ]);
        }
    }
}
