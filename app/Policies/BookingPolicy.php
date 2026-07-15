<?php

namespace App\Policies;

use App\Models\Booking;
use App\Models\User;

class BookingPolicy
{
    public function view(User $user, Booking $booking): bool
    {
        if ($user->hasRole(['admin', 'super-admin'])) {
            return true;
        }

        if ($user->studentProfile) {
            return $booking->student_profile_id === $user->studentProfile->id;
        }

        if ($user->tutorProfile) {
            return $booking->course->tutor_profile_id === $user->tutorProfile->id;
        }

        return false;
    }

    public function update(User $user, Booking $booking): bool
    {
        return $this->view($user, $booking);
    }
}