<?php

namespace App\Policies;

use App\Models\Assignment;
use App\Models\User;

class AssignmentPolicy
{
    /**
     * Tutor can manage (create/edit/grade) assignments for courses they own.
     */
    public function update(User $user, Assignment $assignment): bool
    {
        return $user->tutorProfile
            && $assignment->tutor_profile_id === $user->tutorProfile->id;
    }

    public function delete(User $user, Assignment $assignment): bool
    {
        return $this->update($user, $assignment);
    }

    /**
     * Student can view a published assignment if:
     * - it's course-wide (booking_id null) and they have ANY confirmed booking on that course, OR
     * - it's targeted at their specific booking.
     */
    public function view(User $user, Assignment $assignment): bool
    {
        $studentProfile = $user->studentProfile;

        if (! $studentProfile || ! $assignment->is_published) {
            return false;
        }

        if ($assignment->booking_id) {
            return $assignment->booking?->student_profile_id === $studentProfile->id
                && $assignment->booking->status === 'confirmed';
        }

        return $studentProfile->bookings()  // ← this line is the problem
            ->where('course_id', $assignment->course_id)
            ->where('status', 'confirmed')
            ->exists();
    }

    /**
     * Student can submit if they can view it AND (no due date, or not yet late-locked —
     * adjust here if you want to hard-block late submissions instead of just flagging them).
     */
    public function submitTo(User $user, Assignment $assignment): bool
    {
        if (! $this->view($user, $assignment)) {
            return false;
        }

        // Allow late submissions (flagged 'late' in controller) rather than blocking outright.
        // Flip this to a hard block if you'd rather not accept late work at all:
        // if ($assignment->due_date && now()->greaterThan($assignment->due_date)) return false;

        return true;
    }
}