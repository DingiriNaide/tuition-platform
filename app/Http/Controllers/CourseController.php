<?php

// app/Http/Controllers/CourseController.php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Subject;
use App\Models\TutorProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    // ── Public listing ───────────────────────────────────────────────

    public function index(Request $request): Response
    {
        $query = Course::with(['tutorProfile', 'subject'])
            ->active()
            ->latest();

        if ($request->filled('syllabus')) {
            $query->where('syllabus', $request->syllabus);
        }

        if ($request->filled('medium')) {
            $query->where('medium', $request->medium);
        }

        if ($request->filled('grade')) {
            $query->where('grade', $request->grade);
        }

        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search): void {
                $q->where('title', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $paginator = $query->paginate(12)->withQueryString();

        return Inertia::render('Courses/Index', [
            'courses' => [
                'data'         => $paginator->items(),
                'total'        => $paginator->total(),
                'per_page'     => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'links'        => $paginator->linkCollection()->toArray(),
            ],
            'subjects'        => Subject::active()->orderBy('name')->get(['id', 'name', 'name_sinhala', 'name_tamil', 'syllabus']),
            'filters'         => $request->only(['syllabus', 'medium', 'grade', 'subject_id', 'search']),
            'gradeOptions'    => Course::gradeOptions(),
            'syllabusOptions' => Course::syllabusOptions(),
            'mediumOptions'   => Course::mediumOptions(),
        ]);
    }

    // ── Tutor: create form ───────────────────────────────────────────

    public function create(): Response|RedirectResponse
    {
        $tutorProfile = TutorProfile::where('user_id', Auth::id())->first();

        if (!$tutorProfile) {
            return redirect()->route('tutor.profile.create')
                ->with('error', 'Please complete your tutor profile before creating a course.');
        }

        if (!$tutorProfile->is_verified) {
            return back()->with('error', 'Your tutor profile must be verified before creating courses.');
        }

        $subjects = Subject::active()->orderBy('name')->get(['id', 'name', 'name_sinhala', 'name_tamil', 'syllabus']);

        return Inertia::render('Courses/Create', [
            'subjects'       => $subjects,
            'gradeOptions'   => Course::gradeOptions(),
            'syllabusOptions'=> Course::syllabusOptions(),
            'mediumOptions'  => Course::mediumOptions(),
        ]);
    }

    // ── Tutor: store ─────────────────────────────────────────────────

    public function store(Request $request): RedirectResponse
    {
        $tutorProfile = TutorProfile::where('user_id', Auth::id())->firstOrFail();

        $validated = $request->validate([
            'subject_id'       => ['required', 'exists:subjects,id'],
            'title'            => ['required', 'string', 'max:255'],
            'title_sinhala'    => ['nullable', 'string', 'max:255'],
            'title_tamil'      => ['nullable', 'string', 'max:255'],
            'description'      => ['nullable', 'string', 'max:5000'],
            'description_sinhala' => ['nullable', 'string', 'max:5000'],
            'description_tamil'   => ['nullable', 'string', 'max:5000'],
            'grade'            => ['required', 'in:' . implode(',', array_keys(Course::gradeOptions()))],
            'syllabus'         => ['required', 'in:ol,al,foundation,general'],
            'medium'           => ['required', 'in:sinhala,tamil,english,bilingual'],
            'price_per_session'=> ['nullable', 'numeric', 'min:0', 'max:99999.99'],
            'price_monthly'    => ['nullable', 'numeric', 'min:0', 'max:99999.99'],
            'max_students'     => ['required', 'integer', 'min:1', 'max:500'],
            'is_group'         => ['required', 'boolean'],
            'is_active'        => ['required', 'boolean'],
        ]);

        $course = $tutorProfile->courses()->create($validated);

        return redirect()
            ->action([CourseController::class, 'show'], $course)
            ->with('success', 'Course created successfully.');
    }

    // ── Public: show ─────────────────────────────────────────────────

    public function show(Course $course): Response
    {
        $course->load(['tutorProfile.user', 'subject']);

        $user = Auth::user();
        $tutorProfile = $user
            ? TutorProfile::where('user_id', $user->id)->first()
            : null;

        $canManage = $tutorProfile && $tutorProfile->id === $course->tutor_profile_id;

        // Admins can also manage
        if ($user && $user->hasAnyRole(['admin', 'super-admin'])) {
            $canManage = true;
        }

        return Inertia::render('Courses/Show', [
            'course'          => $course,
            'canManage'       => $canManage,
            'gradeOptions'    => Course::gradeOptions(),
            'syllabusOptions' => Course::syllabusOptions(),
            'mediumOptions'   => Course::mediumOptions(),
        ]);
    }

    // ── Tutor: edit form ─────────────────────────────────────────────

    public function edit(Course $course): Response|RedirectResponse
    {
        $this->authorizeTutorOwnership($course);

        $subjects = Subject::active()->orderBy('name')->get(['id', 'name', 'name_sinhala', 'name_tamil', 'syllabus']);

        return Inertia::render('Courses/Edit', [
            'course'         => $course->load('subject'),
            'subjects'       => $subjects,
            'gradeOptions'   => Course::gradeOptions(),
            'syllabusOptions'=> Course::syllabusOptions(),
            'mediumOptions'  => Course::mediumOptions(),
        ]);
    }

    // ── Tutor: update ────────────────────────────────────────────────

    public function update(Request $request, Course $course): RedirectResponse
    {
        $this->authorizeTutorOwnership($course);

        $validated = $request->validate([
            'subject_id'          => ['required', 'exists:subjects,id'],
            'title'               => ['required', 'string', 'max:255'],
            'title_sinhala'       => ['nullable', 'string', 'max:255'],
            'title_tamil'         => ['nullable', 'string', 'max:255'],
            'description'         => ['nullable', 'string', 'max:5000'],
            'description_sinhala' => ['nullable', 'string', 'max:5000'],
            'description_tamil'   => ['nullable', 'string', 'max:5000'],
            'grade'               => ['required', 'in:' . implode(',', array_keys(Course::gradeOptions()))],
            'syllabus'            => ['required', 'in:ol,al,foundation,general'],
            'medium'              => ['required', 'in:sinhala,tamil,english,bilingual'],
            'price_per_session'   => ['nullable', 'numeric', 'min:0', 'max:99999.99'],
            'price_monthly'       => ['nullable', 'numeric', 'min:0', 'max:99999.99'],
            'max_students'        => ['required', 'integer', 'min:1', 'max:500'],
            'is_group'            => ['required', 'boolean'],
            'is_active'           => ['required', 'boolean'],
        ]);

        $course->update($validated);

        return redirect()
            ->action([CourseController::class, 'show'], $course)
            ->with('success', 'Course updated successfully.');
    }

    // ── Tutor: destroy ───────────────────────────────────────────────

    public function destroy(Course $course): RedirectResponse
    {
        $this->authorizeTutorOwnership($course);

        $course->delete();

        return redirect()
            ->action([CourseController::class, 'index'])
            ->with('success', 'Course deleted successfully.');
    }

    // ── Private helpers ──────────────────────────────────────────────

    private function authorizeTutorOwnership(Course $course): void
    {
        $tutorProfile = TutorProfile::where('user_id', Auth::id())->first();

        abort_unless(
            $tutorProfile && $tutorProfile->id === $course->tutor_profile_id,
            403,
            'You do not own this course.'
        );
    }
}