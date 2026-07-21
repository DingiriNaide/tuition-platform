<?php

namespace App\Http\Controllers\ProfileController;

use App\Http\Controllers\Controller;
use App\Models\ParentProfile;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ParentProfileController extends Controller
{
    public function show(Request $request): Response
    {
        $profile = $request->user()->parentProfile;

        return Inertia::render('Profile/Parent/Show', [
            'profile' => $profile,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Profile/Parent/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'phone'     => 'nullable|string|max:20',
            'district'  => 'nullable|string|max:100',
            'city'      => 'nullable|string|max:100',
            'avatar'    => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        unset($validated['avatar']);

        $profile = $request->user()->parentProfile()->create($validated);
        $request->user()->assignRole('parent');

        if ($request->hasFile('avatar')) {
            $profile->addMediaFromRequest('avatar')->toMediaCollection('avatar');
        }

        return redirect()->route('parent.profile.show')
            ->with('success', 'Profile created successfully.');
    }

    public function edit(Request $request): Response
    {
        $profile = $request->user()->parentProfile;

        return Inertia::render('Profile/Parent/Edit', [
            'profile' => $profile,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'phone'     => 'nullable|string|max:20',
            'district'  => 'nullable|string|max:100',
            'city'      => 'nullable|string|max:100',
            'avatar'    => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        unset($validated['avatar']);

        $profile = $request->user()->parentProfile;
        $profile->update($validated);

        if ($request->hasFile('avatar')) {
            $profile->addMediaFromRequest('avatar')->toMediaCollection('avatar');
        }

        return redirect()->route('parent.profile.show')
            ->with('success', 'Profile updated successfully.');
    }
}