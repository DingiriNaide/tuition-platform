<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\TutorProfile;
use App\Models\TutorPayout;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class TutorEarningsController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $tutorProfile = TutorProfile::where('user_id', Auth::id())->first();

        if (! $tutorProfile) {
            return redirect()->route('tutor.profile.create');
        }

        $query = TutorPayout::with(['payment.booking.course.subject', 'payment.studentProfile'])
            ->where('tutor_profile_id', $tutorProfile->id)
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $payouts = $query->paginate(20)->withQueryString();

        // Summary stats
        $base = TutorPayout::where('tutor_profile_id', $tutorProfile->id);

        $summary = [
            'total_earned'    => (clone $base)->sum('net_amount'),
            'total_pending'   => (clone $base)->where('status', 'pending')->sum('net_amount'),
            'total_paid'      => (clone $base)->where('status', 'paid')->sum('net_amount'),
            'total_gross'     => (clone $base)->sum('gross_amount'),
            'total_commission'=> (clone $base)->sum('commission_amount'),
            'sessions_paid'   => (clone $base)->count(),
        ];

        // Last 6 months trend, for a simple chart
        $monthlyTrend = TutorPayout::where('tutor_profile_id', $tutorProfile->id)
            ->selectRaw("strftime('%Y-%m', created_at) as month, SUM(net_amount) as total")
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return Inertia::render('Tutor/Earnings', [
            'payouts' => [
                'data'         => $payouts->items(),
                'total'        => $payouts->total(),
                'current_page' => $payouts->currentPage(),
                'last_page'    => $payouts->lastPage(),
                'links'        => $payouts->linkCollection()->toArray(),
            ],
            'summary'       => $summary,
            'monthlyTrend'  => $monthlyTrend,
            'filters'       => $request->only('status'),
        ]);
    }
}