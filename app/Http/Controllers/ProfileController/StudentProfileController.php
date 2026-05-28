<?php

namespace App\Http\Controllers\ProfileController;

use App\Http\Controllers\Controller;
use App\Models\StudentProfile;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentProfileController extends Controller
{
    public function show(Request $request): Response
    {
        $profile = $request->user()->studentProfile?->toArray();

        return Inertia::render('Profile/Student/Show', [
            'profile' => $profile,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Profile/Student/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name'     => 'required|string|max:255',
            'date_of_birth' => 'nullable|date',
            'gender'        => 'nullable|in:male,female,other',
            'phone'         => 'nullable|string|max:20',
            'school'        => 'nullable|string|max:255',
            'grade'         => 'nullable|in:grade_6,grade_7,grade_8,grade_9,grade_10,grade_11,al_1,al_2,al_3,foundation',
            'medium'        => 'required|in:sinhala,tamil,english',
            'district'      => 'nullable|string|max:100',
            'city'          => 'nullable|string|max:100',
            'is_low_income' => 'boolean',
        ]);

        $request->user()->studentProfile()->create($validated);
        $request->user()->assignRole('student');

        return redirect()->route('student.profile.show')
            ->with('success', 'Profile created successfully.');
    }

    public function edit(Request $request): Response
    {
        $profile = $request->user()->studentProfile?->toArray();

        return Inertia::render('Profile/Student/Edit', [
            'profile' => $profile,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'full_name'     => 'required|string|max:255',
            'date_of_birth' => 'nullable|date',
            'gender'        => 'nullable|in:male,female,other',
            'phone'         => 'nullable|string|max:20',
            'school'        => 'nullable|string|max:255',
            'grade'         => 'nullable|in:grade_6,grade_7,grade_8,grade_9,grade_10,grade_11,al_1,al_2,al_3,foundation',
            'medium'        => 'required|in:sinhala,tamil,english',
            'district'      => 'nullable|string|max:100',
            'city'          => 'nullable|string|max:100',
            'is_low_income' => 'boolean',
        ]);

        $request->user()->studentProfile()->update($validated);

        return redirect()->route('student.profile.show')
            ->with('success', 'Profile updated successfully.');
    }
}