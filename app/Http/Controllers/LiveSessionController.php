<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Events\ChatMessageEvent;
use App\Events\LiveSessionEvent;
use App\Events\SignalEvent;
use App\Models\BookingSession;
use App\Models\LiveSession;
use App\Models\StudentProfile;
use App\Models\TutorProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class LiveSessionController extends Controller
{
    /**
     * Tutor: create / open the live session room for a booking session.
     * POST /live-sessions
     */
    public function store(Request $request): RedirectResponse
    {
        $tutorProfile = TutorProfile::where('user_id', Auth::id())->firstOrFail();

        $validated = $request->validate([
            'booking_id' => ['required', 'exists:bookings,id'],
        ]);

        $booking = \App\Models\Booking::with(['sessions', 'course'])->findOrFail($validated['booking_id']);

        abort_unless($booking->course->tutor_profile_id === $tutorProfile->id, 403);

        /* $bookingSession = $booking->sessions()
            ->whereIn('status', ['scheduled', 'ongoing'])
            ->orderBy('session_date')
            ->first(); */

        $bookingSession = $booking->sessions()
            ->whereNotIn('status', ['cancelled', 'no_show'])
            ->orderBy('session_date')
            ->first();

        if (!$bookingSession) {
            return back()->with('error', 'No scheduled sessions found.');
        }

        // Reuse existing waiting/live session or create fresh
        $liveSession = LiveSession::firstOrCreate(
            ['booking_session_id' => $bookingSession->id],
            [
                'course_id'        => $booking->course_id,
                'tutor_profile_id' => $tutorProfile->id,
                'channel_name'     => LiveSession::generateChannelName(),
                'status'           => 'waiting',
            ]
        );

        if ($liveSession->status === 'ended') {
            $liveSession->update([
                'channel_name' => LiveSession::generateChannelName(),
                'status'       => 'waiting',
                'started_at'   => null,
                'ended_at'     => null,
            ]);
        }

        return redirect()->action(
            [LiveSessionController::class, 'show'],
            $liveSession
        );
    }

    /**
     * Shared: the live room page — tutor and student both land here.
     * GET /live-sessions/{liveSession}
     */
    public function show(LiveSession $liveSession): Response|RedirectResponse
    {
        $this->authorizeEntry($liveSession);

        $liveSession->load([
            'course.subject',
            'tutorProfile',
            'bookingSession.booking.studentProfile',
        ]);

        $user         = Auth::user();
        $tutorProfile = TutorProfile::where('user_id', $user->id)->first();
        $isTutor      = $tutorProfile && $tutorProfile->id === $liveSession->tutor_profile_id;

        return Inertia::render('LiveSession/Room', [
            'liveSession' => [
                'id'           => $liveSession->id,
                'channel_name' => $liveSession->channel_name,
                'status'       => $liveSession->status,
                'started_at'   => $liveSession->started_at?->toIso8601String(),
                'course'       => [
                    'title'   => $liveSession->course->title,
                    'subject' => $liveSession->course->subject->name,
                ],
            ],
            'currentUser' => [
                'id'      => (string) $user->id,
                'name'    => $isTutor
                    ? $tutorProfile->full_name
                    : (StudentProfile::where('user_id', $user->id)->first()?->full_name ?? $user->name),
                'is_tutor'=> $isTutor,
            ],
        ]);
    }

    /**
     * Tutor: mark session as live (called client-side when tutor clicks "Start").
     * POST /live-sessions/{liveSession}/start
     */
    public function start(LiveSession $liveSession): JsonResponse
    {
        $this->authorizeTutor($liveSession);

        $liveSession->update([
            'status'     => 'live',
            'started_at' => now()->timezone('Asia/Colombo'),
        ]);

        // Also mark the booking session as ongoing
        $liveSession->bookingSession->update(['status' => 'ongoing']);

        broadcast(new LiveSessionEvent(
            channelName: $liveSession->channel_name,
            type: 'session-started',
            data: ['started_at' => $liveSession->started_at->toIso8601String()],
        ));

        return response()->json(['status' => 'live']);
    }

    /**
     * Tutor: end the session.
     * POST /live-sessions/{liveSession}/end
     */
    public function end(LiveSession $liveSession): JsonResponse
    {
        $this->authorizeTutor($liveSession);

        $endedAt = now()->timezone('Asia/Colombo');

        $liveSession->update([
            'status'   => 'ended',
            'ended_at' => $endedAt,
        ]);

        $liveSession->bookingSession->update(['status' => 'completed']);

        broadcast(new LiveSessionEvent(
            channelName: $liveSession->channel_name,
            type: 'session-ended',
            data: ['ended_at' => $endedAt->toIso8601String()],
        ));

        return response()->json(['status' => 'ended']);
    }

    /**
     * WebRTC signalling relay — offer, answer, ICE candidates.
     * POST /live-sessions/{liveSession}/signal
     */
    public function signal(Request $request, LiveSession $liveSession): JsonResponse
    {
        $this->authorizeEntry($liveSession);

        $validated = $request->validate([
            'type'        => ['required', 'in:offer,answer,ice-candidate'],
            'to_user_id'  => ['nullable', 'string'],
            'payload'     => ['required'],
        ]);

        broadcast(new SignalEvent(
            channelName: $liveSession->channel_name,
            type: $validated['type'],
            fromUserId: (string) Auth::id(),
            toUserId: $validated['to_user_id'] ?? '',
            payload: $validated['payload'],
        ));

        return response()->json(['ok' => true]);
    }

    /**
     * Chat message broadcast.
     * POST /live-sessions/{liveSession}/chat
     */
    public function chat(Request $request, LiveSession $liveSession): JsonResponse
    {
        $this->authorizeEntry($liveSession);

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:500'],
        ]);

        $user = Auth::user();
        $name = TutorProfile::where('user_id', $user->id)->first()?->full_name
            ?? StudentProfile::where('user_id', $user->id)->first()?->full_name
            ?? $user->name;

        broadcast(new ChatMessageEvent(
            channelName: $liveSession->channel_name,
            fromUserId: (string) $user->id,
            fromName: $name,
            message: $validated['message'],
            sentAt: now()->timezone('Asia/Colombo')->toIso8601String(),
        ));

        return response()->json(['ok' => true]);
    }

    /**
     * Hand raise / lower.
     * POST /live-sessions/{liveSession}/hand
     */
    public function hand(Request $request, LiveSession $liveSession): JsonResponse
    {
        $this->authorizeEntry($liveSession);

        $validated = $request->validate([
            'raised' => ['required', 'boolean'],
        ]);

        $user = Auth::user();
        $name = StudentProfile::where('user_id', $user->id)->first()?->full_name ?? $user->name;

        broadcast(new LiveSessionEvent(
            channelName: $liveSession->channel_name,
            type: $validated['raised'] ? 'hand-raised' : 'hand-lowered',
            data: [
                'user_id' => (string) $user->id,
                'name'    => $name,
            ],
        ));

        return response()->json(['ok' => true]);
    }

    // ── Private ──────────────────────────────────────────────────────

    private function authorizeEntry(LiveSession $liveSession): void
    {
        $user = Auth::user();

        $isTutor = TutorProfile::where('user_id', $user->id)
            ->where('id', $liveSession->tutor_profile_id)
            ->exists();

        if ($isTutor) {
            return;
        }

        $studentProfile = StudentProfile::where('user_id', $user->id)->first();

        $isStudent = $studentProfile && $liveSession->bookingSession
            ->booking()
            ->where('student_profile_id', $studentProfile->id)
            ->whereIn('status', ['confirmed'])
            ->exists();

        abort_unless($isStudent, 403);
    }

    private function authorizeTutor(LiveSession $liveSession): void
    {
        $tutorProfile = TutorProfile::where('user_id', Auth::id())->first();

        abort_unless(
            $tutorProfile && $tutorProfile->id === $liveSession->tutor_profile_id,
            403
        );
    }
}
