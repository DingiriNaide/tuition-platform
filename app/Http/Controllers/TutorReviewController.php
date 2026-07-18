<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\TutorReview;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TutorReviewController extends Controller
{
    public function store(Request $request, Booking $booking): RedirectResponse
    {
        $studentProfile = Auth::user()->studentProfile;

        abort_unless($studentProfile && $booking->student_profile_id === $studentProfile->id, 403);

        $hasCompletedSession = $booking->sessions()->where('status', 'completed')->exists();
        abort_unless($hasCompletedSession, 422, 'You can only review a course after completing a session.');

        $validated = $request->validate([
            'rating'  => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        TutorReview::updateOrCreate(
            [
                'course_id'           => $booking->course_id,
                'student_profile_id'  => $studentProfile->id,
            ],
            [
                'tutor_profile_id' => $booking->course->tutor_profile_id,
                'booking_id'       => $booking->id,
                'rating'           => $validated['rating'],
                'comment'          => $validated['comment'] ?? null,
            ]
        );

        return back()->with('success', 'Thanks for your review!');
    }
}