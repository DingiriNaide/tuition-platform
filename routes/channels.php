<?php

use App\Models\BookingSession;
use App\Models\LiveSession;
use App\Models\StudentProfile;
use App\Models\TutorProfile;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('live.{channelName}', function ($user, string $channelName): array|false {
    $liveSession = LiveSession::with('bookingSession.booking')
        ->where('channel_name', $channelName)
        ->whereIn('status', ['waiting', 'live'])
        ->first();

    if (!$liveSession) {
        return false;
    }

    // Tutor who owns this session
    $tutorProfile = TutorProfile::where('user_id', $user->id)->first();
    if ($tutorProfile && $tutorProfile->id === $liveSession->tutor_profile_id) {
        return [
            'id'   => (string) $user->id,
            'name' => $tutorProfile->full_name,
            'role' => 'tutor',
        ];
    }

    // Student with a confirmed booking for this session
    $studentProfile = StudentProfile::where('user_id', $user->id)->first();
    if ($studentProfile) {
        $hasBooking = $liveSession->bookingSession
            ->booking()
            ->where('student_profile_id', $studentProfile->id)
            ->whereIn('status', ['confirmed'])
            ->exists();

        if ($hasBooking) {
            return [
                'id'   => (string) $user->id,
                'name' => $studentProfile->full_name,
                'role' => 'student',
            ];
        }
    }

    return false;
});
