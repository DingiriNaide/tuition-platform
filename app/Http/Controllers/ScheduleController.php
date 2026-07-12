<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Schedule;
use App\Models\TutorProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleController extends Controller
{
    // ── Tutor: list own schedules ────────────────────────────────────

    public function index(): Response|RedirectResponse
    {
        $tutorProfile = TutorProfile::where('user_id', Auth::id())->first();

        if (!$tutorProfile) {
            return redirect()->route('tutor.profile.create');
        }

        $schedules = Schedule::with('course.subject')
            ->where('tutor_profile_id', $tutorProfile->id)
            ->orderBy('is_active', 'desc')
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();

        return Inertia::render('Schedules/Index', [
            'schedules'  => $schedules,
            'dayOptions' => Schedule::dayOptions(),
        ]);
    }

    // ── Tutor: create form ───────────────────────────────────────────

    public function create(): Response|RedirectResponse
    {
        $tutorProfile = TutorProfile::where('user_id', Auth::id())->first();

        if (!$tutorProfile?->is_verified) {
            return back()->with('error', 'Your profile must be verified before adding schedules.');
        }

        $courses = Course::where('tutor_profile_id', $tutorProfile->id)
            ->where('is_active', true)
            ->with('subject')
            ->get(['id', 'title', 'subject_id', 'max_students']);

        return Inertia::render('Schedules/Create', [
            'courses'    => $courses,
            'dayOptions' => Schedule::dayOptions(),
        ]);
    }

    // ── Tutor: store ─────────────────────────────────────────────────

    public function store(Request $request): RedirectResponse
    {
        $tutorProfile = TutorProfile::where('user_id', Auth::id())->firstOrFail();

        $validated = $request->validate([
            'course_id'     => ['required', 'exists:courses,id'],
            'is_recurring'  => ['required', 'boolean'],
            'day_of_week'   => ['required_if:is_recurring,true', 'nullable',
                                'in:' . implode(',', array_keys(Schedule::dayOptions()))],
            'specific_date' => ['required_if:is_recurring,false', 'nullable', 'date',
                                'after_or_equal:today'],
            'start_time'    => ['required', 'date_format:H:i'],
            'end_time'      => ['required', 'date_format:H:i', 'after:start_time'],
            'recur_until'   => ['nullable', 'date', 'after:today'],
            'max_students'  => ['nullable', 'integer', 'min:1', 'max:500'],
            'is_active'     => ['required', 'boolean'],
        ]);

        // Ensure tutor owns this course
        $course = Course::findOrFail($validated['course_id']);
        abort_unless($course->tutor_profile_id === $tutorProfile->id, 403);

        $tutorProfile->schedules()->create($validated);

        return redirect()
            ->action([ScheduleController::class, 'index'])
            ->with('success', 'Schedule added successfully.');
    }

    // ── Tutor: edit ──────────────────────────────────────────────────

    public function edit(Schedule $schedule): Response|RedirectResponse
    {
        $this->authorizeOwnership($schedule);

        $tutorProfile = TutorProfile::where('user_id', Auth::id())->firstOrFail();

        $courses = Course::where('tutor_profile_id', $tutorProfile->id)
            ->where('is_active', true)
            ->with('subject')
            ->get(['id', 'title', 'subject_id', 'max_students']);

        return Inertia::render('Schedules/Edit', [
            'schedule'   => $schedule->load('course.subject'),
            'courses'    => $courses,
            'dayOptions' => Schedule::dayOptions(),
        ]);
    }

    // ── Tutor: update ────────────────────────────────────────────────

    public function update(Request $request, Schedule $schedule): RedirectResponse
    {
        $this->authorizeOwnership($schedule);

        $validated = $request->validate([
            'course_id'     => ['required', 'exists:courses,id'],
            'is_recurring'  => ['required', 'boolean'],
            'day_of_week'   => ['required_if:is_recurring,true', 'nullable',
                                'in:' . implode(',', array_keys(Schedule::dayOptions()))],
            'specific_date' => ['required_if:is_recurring,false', 'nullable', 'date'],
            'start_time'    => ['required', 'date_format:H:i'],
            'end_time'      => ['required', 'date_format:H:i', 'after:start_time'],
            'recur_until'   => ['nullable', 'date'],
            'max_students'  => ['nullable', 'integer', 'min:1', 'max:500'],
            'is_active'     => ['required', 'boolean'],
        ]);

        $schedule->update($validated);

        return redirect()
            ->action([ScheduleController::class, 'index'])
            ->with('success', 'Schedule updated.');
    }

    // ── Tutor: destroy ───────────────────────────────────────────────

    public function destroy(Schedule $schedule): RedirectResponse
    {
        $this->authorizeOwnership($schedule);

        // Prevent deletion if confirmed bookings exist
        $hasConfirmed = $schedule->bookings()
            ->whereIn('status', ['pending', 'confirmed'])
            ->exists();

        if ($hasConfirmed) {
            return back()->with('error', 'Cannot delete a schedule with active bookings. Deactivate it instead.');
        }

        $schedule->delete();

        return redirect()
            ->action([ScheduleController::class, 'index'])
            ->with('success', 'Schedule deleted.');
    }

    // ── Private ──────────────────────────────────────────────────────

    private function authorizeOwnership(Schedule $schedule): void
    {
        $tutorProfile = TutorProfile::where('user_id', Auth::id())->first();
        abort_unless(
            $tutorProfile && $tutorProfile->id === $schedule->tutor_profile_id,
            403
        );
    }
}
