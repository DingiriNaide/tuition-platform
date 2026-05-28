<?php

namespace App\Http\Controllers\ProfileController;

use App\Http\Controllers\Controller;
use App\Models\TutorProfile;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TutorProfileController extends Controller
{
    public function show(Request $request): Response
    {
        $profile = $request->user()->tutorProfile;

        return Inertia::render('Profile/Tutor/Show', [
            'profile' => $profile,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Profile/Tutor/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name'   => 'required|string|max:255',
            'phone'       => 'nullable|string|max:20',
            'nic_number'  => 'nullable|string|max:20',
            'city'        => 'nullable|string|max:100',
            'district'    => 'nullable|string|max:100',
            'bio'         => 'nullable|string|max:1000',
            'hourly_rate' => 'nullable|numeric|min:0',
            'medium'      => 'required|in:sinhala,tamil,english,bilingual',
        ]);

        $request->user()->tutorProfile()->create($validated);
        $request->user()->assignRole('tutor');

        return redirect()->route('tutor.profile.show')
            ->with('success', 'Profile created successfully.');
    }

    public function edit(Request $request): Response
    {
        $profile = $request->user()->tutorProfile;

        return Inertia::render('Profile/Tutor/Edit', [
            'profile' => $profile,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'full_name'   => 'required|string|max:255',
            'phone'       => 'nullable|string|max:20',
            'nic_number'  => 'nullable|string|max:20',
            'city'        => 'nullable|string|max:100',
            'district'    => 'nullable|string|max:100',
            'bio'         => 'nullable|string|max:1000',
            'hourly_rate' => 'nullable|numeric|min:0',
            'medium'      => 'required|in:sinhala,tamil,english,bilingual',
        ]);

        $request->user()->tutorProfile()->update($validated);

        return redirect()->route('tutor.profile.show')
            ->with('success', 'Profile updated successfully.');
    }
}