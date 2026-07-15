<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Booking;
use App\Models\Course;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

/* abstract class Controller
{
    use AuthorizesRequests;
} */

class AssignmentController extends Controller
{
    // Tutor: list assignments for a course
    public function index(Course $course)
    {
        $this->authorize('update', $course); // tutor owns course

        return Inertia::render('Assignments/Index', [
            'course' => $course,
            'assignments' => $course->assignments()
                ->withCount(['submissions', 'submissions as graded_count' => fn ($q) => $q->where('status', 'graded')])
                ->latest()
                ->get(),
        ]);
    }

    public function create(Course $course)
    {
        $this->authorize('update', $course);

        return Inertia::render('Assignments/Create', [
            'course' => $course,
            'students' => $course->bookings()->with('studentProfile.user')->get(), // for individual assignment
        ]);
    }

    public function store(Request $request, Course $course)
    {
        $this->authorize('update', $course);

        $validated = $request->validate([
        'booking_id' => 'nullable|exists:bookings,id',
        'title' => 'required|string|max:255',
        'description' => 'nullable|string',
        'type' => 'required|in:objective,subjective,mixed',
        'questions' => 'nullable|array',
        'questions.*.id' => 'nullable|string',
        'questions.*.text' => 'required_with:questions|string',
        'questions.*.options' => 'nullable|array',
        'questions.*.options.*' => 'nullable|string',
        'questions.*.correct_answer' => 'nullable|string',
        'questions.*.marks' => 'nullable|integer|min:0|max:100',
        'total_marks' => 'required|integer|min:1|max:1000',
        'due_date' => 'nullable|date',
        'is_published' => 'boolean',
        'attachments.*' => 'nullable|file|max:10240',
    ]);

    if (in_array($validated['type'], ['objective', 'mixed']) && !empty($validated['questions'])) {
        $questionSum = collect($validated['questions'])->sum('marks');

        if ($questionSum !== (int) $validated['total_marks']) {
            return back()->withErrors([
                'total_marks' => "Total marks ({$validated['total_marks']}) must equal the sum of question marks ({$questionSum}).",
            ])->withInput();
        }
    }

        $assignment = $course->assignments()->create([
            ...$validated,
            'tutor_profile_id' => $course->tutor_profile_id,
        ]);

        foreach ($request->file('attachments', []) as $file) {
            $assignment->addMedia($file)->toMediaCollection('attachments');
        }

        return redirect()->route('assignments.index', $course)
            ->with('success', 'Assignment created.');
    }

    // Student: view + submit
    public function studentIndex(Booking $booking)
    {
        $this->authorize('view', $booking);

        $assignments = Assignment::where('is_published', true)
            ->where('course_id', $booking->course_id)
            ->where(fn ($q) => $q->whereNull('booking_id')->orWhere('booking_id', $booking->id))
            ->with(['submissions' => fn ($q) => $q->where('student_profile_id', $booking->student_profile_id)])
            ->get();

        return Inertia::render('Assignments/StudentIndex', compact('booking', 'assignments'));
    }

    public function submit(Request $request, Assignment $assignment)
    {
        $studentProfile = $request->user()->studentProfile;
        $this->authorize('submitTo', $assignment); // policy checks enrollment

        $validated = $request->validate([
            'text_answer' => 'nullable|string',
            'objective_answers' => 'nullable|array',
            'files.*' => 'nullable|file|max:10240',
        ]);

        $isLate = $assignment->due_date && now()->greaterThan($assignment->due_date);

        $submission = AssignmentSubmission::updateOrCreate(
            ['assignment_id' => $assignment->id, 'student_profile_id' => $studentProfile->id],
            [
                ...$validated,
                'status' => $isLate ? 'late' : 'submitted',
                'submitted_at' => now(),
                'auto_graded_score' => $this->autoGrade($assignment, $validated['objective_answers'] ?? []),
            ]
        );

        foreach ($request->file('files', []) as $file) {
            $submission->addMedia($file)->toMediaCollection('submission_files');
        }

        return back()->with('success', 'Submission recorded.');
    }

    // Tutor: grade
    public function grade(Request $request, AssignmentSubmission $submission)
    {
        $this->authorize('update', $submission->assignment->course);

        $validated = $request->validate([
            'final_score' => 'required|integer|min:0|max:' . $submission->assignment->total_marks,
            'tutor_feedback' => 'nullable|string',
        ]);

        $submission->update([
            ...$validated,
            'status' => 'graded',
            'graded_at' => now(),
        ]);

        return back()->with('success', 'Graded.');
    }

    private function autoGrade(Assignment $assignment, array $answers): ?int
    {
        if (! in_array($assignment->type, ['objective', 'mixed']) || ! $assignment->questions) {
            return null;
        }

        $score = 0;
        foreach ($assignment->questions as $q) {
            if (($answers[$q['id']] ?? null) === ($q['correct_answer'] ?? null)) {
                $score += $q['marks'] ?? 1;
            }
        }

        return $score;
    }

    public function edit(Assignment $assignment)
    {
        $this->authorize('update', $assignment);

        $assignment->load('media');

        return Inertia::render('Assignments/Create', [
            'course' => $assignment->course,
            'students' => $assignment->course->bookings()->with('studentProfile.user')->get(),
            'assignment' => [
                'id' => $assignment->id,
                'booking_id' => $assignment->booking_id,
                'title' => $assignment->title,
                'description' => $assignment->description,
                'type' => $assignment->type,
                'questions' => $assignment->questions ?? [],
                'total_marks' => $assignment->total_marks,
                'due_date' => $assignment->due_date?->format('Y-m-d\TH:i'),
                'is_published' => $assignment->is_published,
                'existing_attachments' => $assignment->getMedia('attachments')->map(fn ($m) => [
                    'id' => $m->id,
                    'name' => $m->file_name,
                    'url' => $m->getUrl(),
                ]),
            ],
        ]);
    }

    public function update(Request $request, Assignment $assignment)
    {
        $this->authorize('update', $assignment);

        $validated = $request->validate([
        'booking_id' => 'nullable|exists:bookings,id',
        'title' => 'required|string|max:255',
        'description' => 'nullable|string',
        'type' => 'required|in:objective,subjective,mixed',
        'questions' => 'nullable|array',
        'questions.*.id' => 'nullable|string',
        'questions.*.text' => 'required_with:questions|string',
        'questions.*.options' => 'nullable|array',
        'questions.*.options.*' => 'nullable|string',
        'questions.*.correct_answer' => 'nullable|string',
        'questions.*.marks' => 'nullable|integer|min:0|max:100',
        'total_marks' => 'required|integer|min:1|max:1000',
        'due_date' => 'nullable|date',
        'is_published' => 'boolean',
        'attachments.*' => 'nullable|file|max:10240',
    ]);

    if (in_array($validated['type'], ['objective', 'mixed']) && !empty($validated['questions'])) {
        $questionSum = collect($validated['questions'])->sum('marks');

        if ($questionSum !== (int) $validated['total_marks']) {
            return back()->withErrors([
                'total_marks' => "Total marks ({$validated['total_marks']}) must equal the sum of question marks ({$questionSum}).",
            ])->withInput();
        }
    }

        $assignment->update($validated);

        foreach ($request->file('attachments', []) as $file) {
            $assignment->addMedia($file)->toMediaCollection('attachments');
        }

        return redirect()->route('assignments.index', $assignment->course_id)
            ->with('success', 'Assignment updated.');
    }

    public function destroy(Assignment $assignment)
    {
        $this->authorize('delete', $assignment);

        $assignment->delete(); // cascades to assignment_submissions via FK, and media via Spatie's model event

        return redirect()->route('assignments.index', $assignment->course_id)
            ->with('success', 'Assignment deleted.');
    }

    public function submissions(Assignment $assignment)
    {
        $this->authorize('update', $assignment);

        $assignment->load(['submissions.studentProfile', 'submissions.media']);

        return Inertia::render('Assignments/Submissions', [
            'assignment' => $assignment,
            'submissions' => $assignment->submissions->map(fn ($s) => [
                'id' => $s->id,
                'student_name' => $s->studentProfile->full_name,
                'text_answer' => $s->text_answer,
                'objective_answers' => $s->objective_answers,
                'auto_graded_score' => $s->auto_graded_score,
                'final_score' => $s->final_score,
                'tutor_feedback' => $s->tutor_feedback,
                'status' => $s->status,
                'submitted_at' => $s->submitted_at?->format('Y-m-d H:i'),
                'files' => $s->getMedia('submission_files')->map(fn ($m) => [
                    'name' => $m->file_name,
                    'url' => $m->getUrl(),
                ]),
            ]),
        ]);
    }
}