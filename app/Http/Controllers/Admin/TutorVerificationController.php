<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TutorProfile;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TutorVerificationController extends Controller
{
    public function index(): Response
    {
        $pending = TutorProfile::with(['user', 'subjects'])
            ->where('is_verified', false)
            ->latest()
            ->get();

        $verified = TutorProfile::with(['user', 'subjects'])
            ->where('is_verified', true)
            ->latest()
            ->get();

        return Inertia::render('Admin/TutorVerification/Index', [
            'pending'  => $pending,
            'verified' => $verified,
        ]);
    }

    public function show(TutorProfile $tutorProfile): Response
    {
        $tutorProfile->load(['user', 'subjects']);

        return Inertia::render('Admin/TutorVerification/Show', [
            'tutor' => $tutorProfile,
        ]);
    }

    public function approve(Request $request, TutorProfile $tutorProfile)
    {
        $tutorProfile->update([
            'is_verified' => true,
            'is_active'   => true,
        ]);

        return redirect()->route('admin.tutors.index')
            ->with('success', "{$tutorProfile->full_name} has been verified and activated.");
    }

    public function reject(Request $request, TutorProfile $tutorProfile)
    {
        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $tutorProfile->update([
            'is_verified' => false,
            'is_active'   => false,
        ]);

        return redirect()->route('admin.tutors.index')
            ->with('error', "{$tutorProfile->full_name} has been rejected.");
    }
}