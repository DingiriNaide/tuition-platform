<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SubjectController extends Controller
{
    public function index(): Response
    {
        $subjects = Subject::withCount('courses')->orderBy('name')->paginate(20);

        return Inertia::render('Admin/Subjects/Index', [
            'subjects' => $subjects,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'         => ['required', 'string', 'max:255', 'unique:subjects,name'],
            'name_sinhala' => ['nullable', 'string', 'max:255'],
            'name_tamil'   => ['nullable', 'string', 'max:255'],
            'syllabus'     => ['required', 'in:ol,al,foundation,general'],
            'is_active'    => ['boolean'],
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        Subject::create($validated);

        return redirect()->back()->with('success', 'Subject created.');
    }

    public function update(Request $request, Subject $subject): RedirectResponse
    {
        $validated = $request->validate([
            'name'         => ['required', 'string', 'max:255', 'unique:subjects,name,' . $subject->id],
            'name_sinhala' => ['nullable', 'string', 'max:255'],
            'name_tamil'   => ['nullable', 'string', 'max:255'],
            'syllabus'     => ['required', 'in:ol,al,foundation,general'],
            'is_active'    => ['boolean'],
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        $subject->update($validated);

        return redirect()->back()->with('success', 'Subject updated.');
    }

    public function toggle(Subject $subject): RedirectResponse
    {
        $subject->update(['is_active' => ! $subject->is_active]);

        return redirect()->back()->with('success',
            $subject->is_active ? 'Subject activated.' : 'Subject deactivated.'
        );
    }

    public function destroy(Subject $subject): RedirectResponse
    {
        if ($subject->courses()->exists()) {
            return back()->with('error', 'Cannot delete a subject with existing courses. Deactivate it instead.');
        }

        $subject->delete();

        return redirect()->back()->with('success', 'Subject deleted.');
    }
}