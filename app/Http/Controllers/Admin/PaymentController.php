<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Payment::with([
            'booking.course.subject',
            'booking.course.tutorProfile',
            'studentProfile',
            'voucher',
        ])->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search): void {
                $q->where('payhere_order_id', 'like', "%{$search}%")
                  ->orWhereHas('studentProfile', fn ($sq) => $sq->where('full_name', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $payments = $query->paginate(20)->withQueryString();

        // Quick summary stats for the header
        $summary = [
            'total_completed' => Payment::where('status', 'completed')->sum('amount'),
            'total_refunded'  => Payment::where('status', 'refunded')->sum('amount'),
            'pending_count'   => Payment::where('status', 'pending')->count(),
        ];

        return Inertia::render('Admin/Payments/Index', [
            'payments' => [
                'data'         => $payments->items(),
                'total'        => $payments->total(),
                'current_page' => $payments->currentPage(),
                'last_page'    => $payments->lastPage(),
                'links'        => $payments->linkCollection()->toArray(),
            ],
            'summary' => $summary,
            'filters' => $request->only(['status', 'search', 'date_from', 'date_to']),
        ]);
    }
}