<?php
// app/Http/Controllers/PaymentController.php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\TutorPayout;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    /**
     * Show the payment initiation page for a confirmed booking.
     */
    public function initiate(Request $request, Booking $booking): Response|RedirectResponse
    {
        $user           = Auth::user();
        $studentProfile = $user->studentProfile;

        if (! $studentProfile || $booking->student_profile_id !== $studentProfile->id) {
            abort(403);
        }

        if ($booking->status !== 'confirmed') {
            return redirect()->back()->with('error', 'Booking must be confirmed before payment.');
        }

        if ($booking->payment_status === 'paid') {
            return redirect()->back()->with('info', 'This booking is already paid.');
        }

        if ($booking->billing_type === 'per_session' && $booking->amount_due <= 0) {
            return redirect()->back()->with('info', 'No outstanding balance — attend a session first.');
        }

        $booking->load(['course.subject', 'schedule', 'latestPayment']);

        // ── Voucher ───────────────────────────────────────────────────────────────
        $voucherCode  = $request->input('voucher_code');
        $voucher      = null;
        $discount     = 0;
        $voucherError = null;

        if ($voucherCode) {
            $voucher = \App\Models\Voucher::where('code', strtoupper($voucherCode))->first();

            if (! $voucher || ! $voucher->isValid($studentProfile)) {
                $voucherError = 'Invalid or expired voucher code.';
                $voucher      = null;
            } else {
                $discount = $voucher->discountFor((float) $booking->amount_due);
            }
        }

        $eligibleVouchers = \App\Models\Voucher::where('is_active', true)
            ->where(function ($q) use ($studentProfile) {
                $q->where('is_low_income_only', false)
                ->orWhere(function ($q2) use ($studentProfile) {
                    $q2->where('is_low_income_only', true)
                        ->where(fn () => $studentProfile->is_low_income);
                });
            })
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->where(function ($q) {
                $q->whereNull('max_uses')->orWhereColumn('times_used', '<', 'max_uses');
            })
            ->get(['code', 'type', 'value', 'is_low_income_only']);

        $finalAmount = max(0, (float) $booking->amount_due - $discount);

        // ── Payment record ────────────────────────────────────────────────────────
        if ($booking->billing_type === 'per_session') {
            // Assign a shared batch order ID to all pending session payments
            $pendingPayments = $booking->payments()->where('status', 'pending')->get();
            $batchOrderId    = 'TP-' . strtoupper(uniqid()) . '-' . $booking->id;
            $pendingPayments->each(fn ($p) => $p->update(['payhere_order_id' => $batchOrderId]));

            // Use a virtual payment object for the checkout page
            $payment = (object) [
                'id'               => null,
                'payhere_order_id' => $batchOrderId,
                'amount'           => $finalAmount ?: $pendingPayments->sum('amount'),
                'currency'         => 'LKR',
                'status'           => 'pending',
            ];
        } else {
            // Monthly — reuse existing pending or create new
            $payment = $booking->payments()->where('status', 'pending')->first();

            if ($payment) {
                // Update amount if voucher applied
                $payment->update([
                    'amount'          => $finalAmount,
                    'voucher_id'      => $voucher?->id,
                    'discount_amount' => $discount,
                ]);
            } else {
                $payment = DB::transaction(function () use ($booking, $studentProfile, $finalAmount, $voucher, $discount): Payment {
                    $p                     = new Payment();
                    $p->booking_id         = $booking->id;
                    $p->student_profile_id = $studentProfile->id;
                    $p->amount             = $finalAmount;
                    $p->currency           = 'LKR';
                    $p->status             = 'pending';
                    $p->voucher_id         = $voucher?->id;
                    $p->discount_amount    = $discount;
                    $p->save();
                    $p->payhere_order_id   = $p->generateOrderId();
                    $p->save();

                    if ($voucher) {
                        $voucher->increment('times_used');
                    }

                    return $p;
                });
            }
        }

        // ── Hash ──────────────────────────────────────────────────────────────────
        $merchantId      = config('payhere.merchant_id');
        $merchantSecret  = config('payhere.merchant_secret');
        $hashedSecret    = strtoupper(md5($merchantSecret));
        $amountFormatted = number_format((float) $payment->amount, 2, '.', '');
        $hash = strtoupper(
            md5($merchantId . $payment->payhere_order_id . $amountFormatted . $payment->currency . $hashedSecret)
        );

        return Inertia::render('Payments/Checkout', [
            'booking' => [
                'id'             => $booking->id,
                'course_title'   => $booking->course->title,
                'subject_name'   => $booking->course->subject->name,
                'billing_type'   => $booking->billing_type,
                'amount_due'     => $booking->amount_due,
                'payment_status' => $booking->payment_status,
            ],
            'payment' => [
                'id'       => $payment->id,
                'order_id' => $payment->payhere_order_id,
                'amount'   => $payment->amount,
                'currency' => $payment->currency,
                'status'   => $payment->status,
            ],
            'payhere' => [
                'merchant_id'  => $merchantId,
                'hash'         => $hash,
                'notify_url'   => config('payhere.notify_url'),
                'return_url'   => config('payhere.return_url'),
                'cancel_url'   => config('payhere.cancel_url'),
                'sandbox'      => config('payhere.sandbox'),
                'checkout_url' => config('payhere.sandbox')
                    ? config('payhere.checkout_url')
                    : config('payhere.checkout_url_live'),
            ],
            'student' => [
                'full_name' => $studentProfile->full_name,
                'phone'     => $studentProfile->phone,
                'email'     => $user->email,
            ],
            'voucher' => $voucher ? [
                'code'            => $voucher->code,
                'discount_amount' => $discount,
                'type'            => $voucher->type,
                'value'           => $voucher->value,
            ] : null,
            'voucher_error' => $voucherError,
            'available_vouchers' => $eligibleVouchers,
        ]);
    }

    /**
     * Mock checkout page — simulates PayHere's hosted page.
     * In production this is replaced by the real PayHere redirect.
     */
    public function mockCheckout(Request $request): Response
    {
        // PayHere would POST these fields to their hosted page.
        // We render our own simulation.
        $data = $request->validate([
            'merchant_id'  => ['required', 'string'],
            'order_id'     => ['required', 'string'],
            'amount'       => ['required', 'numeric'],
            'currency'     => ['required', 'string'],
            'hash'         => ['required', 'string'],
            'first_name'   => ['required', 'string'],
            'last_name'    => ['required', 'string'],
            'email'        => ['required', 'email'],
            'phone'        => ['required', 'string'],
            'items'        => ['required', 'string'],
            'return_url'   => ['required', 'string'],
            'cancel_url'   => ['required', 'string'],
            'notify_url'   => ['required', 'string'],
        ]);

        return Inertia::render('Payments/MockCheckout', [
            'checkoutData' => $data,
        ]);
    }

    /**
     * Mock: simulate a successful PayHere payment.
     * Posts to our own notify_url as PayHere would.
     */
    public function mockSuccess(Request $request): RedirectResponse
    {
        $orderId  = $request->input('order_id');
        $payments = Payment::where('payhere_order_id', $orderId)->get();
        $totalAmount = $payments->sum('amount');

        $simulatedPayload = [
            'merchant_id'      => config('payhere.merchant_id'),
            'order_id'         => $orderId,
            'payment_id'       => 'MOCK-' . strtoupper(uniqid()),
            'payhere_amount'   => number_format((float) $totalAmount, 2, '.', ''),
            'payhere_currency' => 'LKR',
            'status_code'      => '2',
            'status_message'   => 'Successfully completed',
            'method'           => $request->input('method', 'VISA'),
            'card_holder_name' => $request->input('card_holder_name', 'Mock User'),
            'card_no'          => '************1234',
            'card_expiry'      => '12/26',
            'md5sig'           => $this->generateMd5Sig(
                config('payhere.merchant_id'),
                $orderId,
                number_format((float) $totalAmount, 2, '.', ''),
                'LKR', '2',
                config('payhere.merchant_secret')
            ),
        ];

        $this->processWebhookPayload($simulatedPayload);

        return redirect()->route('payments.return', ['order_id' => $orderId]);
    }

    public function mockFail(Request $request): RedirectResponse
    {
        $orderId     = $request->input('order_id');
        $payments    = Payment::where('payhere_order_id', $orderId)->get();
        $totalAmount = $payments->sum('amount');

        $simulatedPayload = [
            'merchant_id'      => config('payhere.merchant_id'),
            'order_id'         => $orderId,
            'payment_id'       => 'MOCK-FAIL-' . strtoupper(uniqid()),
            'payhere_amount'   => number_format((float) $totalAmount, 2, '.', ''),
            'payhere_currency' => 'LKR',
            'status_code'      => '-2',
            'status_message'   => 'Payment failed (mock)',
            'method'           => 'VISA',
            'md5sig'           => $this->generateMd5Sig(
                config('payhere.merchant_id'),
                $orderId,
                number_format((float) $totalAmount, 2, '.', ''),
                'LKR', '-2',
                config('payhere.merchant_secret')
            ),
        ];

        $this->processWebhookPayload($simulatedPayload);

        return redirect()->route('payments.cancel', ['order_id' => $orderId]);
    }

    /**
     * PayHere webhook endpoint (notify_url).
     * Called server-to-server by PayHere — no auth middleware.
     */
    public function webhook(Request $request): HttpResponse
    {
        Log::info('PayHere webhook received', $request->all());

        $payload = $request->all();

        // Validate md5sig
        $expectedSig = $this->generateMd5Sig(
            $payload['merchant_id']    ?? '',
            $payload['order_id']       ?? '',
            $payload['payhere_amount'] ?? '',
            $payload['payhere_currency'] ?? '',
            $payload['status_code']    ?? '',
            config('payhere.merchant_secret')
        );

        if (strtoupper($payload['md5sig'] ?? '') !== $expectedSig) {
            Log::warning('PayHere webhook: invalid md5sig', ['order_id' => $payload['order_id'] ?? null]);
            return response('Invalid signature', 400);
        }

        $this->processWebhookPayload($payload);

        return response('OK', 200);
    }

    /**
     * Return URL — user lands here after PayHere redirects back.
     */
    public function return(Request $request): Response
    {
        $orderId = $request->input('order_id');
        $payment = Payment::with('booking')->where('payhere_order_id', $orderId)->first();

        return Inertia::render('Payments/Return', [
            'payment' => $payment ? [
                'order_id'   => $payment->payhere_order_id,
                'status'     => $payment->status,
                'amount'     => $payment->amount,
                'currency'   => $payment->currency,
                'paid_at'    => $payment->paid_at?->timezone('Asia/Colombo')->toIso8601String(),
                'booking_id' => $payment->booking_id,
            ] : null,
        ]);
    }

    /**
     * Cancel URL — user cancelled at PayHere.
     */
    public function cancel(Request $request): Response
    {
        $orderId = $request->input('order_id');
        $payment = Payment::with('booking')->where('payhere_order_id', $orderId)->first();

        return Inertia::render('Payments/Cancel', [
            'payment' => $payment ? [
                'order_id'   => $payment->payhere_order_id,
                'status'     => $payment->status,
                'amount'     => $payment->amount,
                'currency'   => $payment->currency,
                'booking_id' => $payment->booking_id,
            ] : null,
        ]);
    }

    /**
     * Student payment history.
     */
    public function index(): Response
    {
        $studentProfile = Auth::user()->studentProfile;

        if (! $studentProfile) {
            abort(403);
        }

        $payments = Payment::with(['booking.course.subject'])
            ->where('student_profile_id', $studentProfile->id)
            ->latest()
            ->paginate(15);

        return Inertia::render('Payments/Index', [
            'payments' => $payments,
        ]);
    }

    public function refund(Payment $payment): RedirectResponse
    {
        $studentProfile = Auth::user()->studentProfile;

        // Only admin or the student who owns the payment
        $isAdmin   = Auth::user()->hasAnyRole(['admin', 'super-admin']);
        $isOwner   = $studentProfile && $payment->student_profile_id === $studentProfile->id;

        abort_unless($isAdmin || $isOwner, 403);
        abort_unless($payment->status === 'completed', 422);

        DB::transaction(function () use ($payment): void {
            $payment->update(['status' => 'refunded']);

            $booking = $payment->booking;
            $booking->decrement('amount_paid', $payment->amount);

            // For per_session, also decrement amount_due
            if ($booking->billing_type === 'per_session') {
                $booking->decrement('amount_due', $payment->amount);
            }

            $booking->fresh()->recalculatePaymentStatus();
        });

        return redirect()->back()->with('success', 'Payment refunded successfully.');
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────

    private function generateMd5Sig(
        string $merchantId,
        string $orderId,
        string $amount,
        string $currency,
        string $statusCode,
        string $merchantSecret
    ): string {
        $hashedSecret = strtoupper(md5($merchantSecret));
        return strtoupper(
            md5($merchantId . $orderId . $amount . $currency . $statusCode . $hashedSecret)
        );
    }

    private function processWebhookPayload(array $payload): void
    {
        $orderId    = $payload['order_id'];
        $statusCode = (int) ($payload['status_code'] ?? 0);

        $payments = Payment::where('payhere_order_id', $orderId)->get();

        if ($payments->isEmpty()) {
            Log::error('PayHere webhook: payment not found', ['order_id' => $orderId]);
            return;
        }

        $methodMap = [
            'VISA'   => 'card',  'MASTER' => 'card',
            'AMEX'   => 'card',  'EZCASH' => 'ezcash',
            'MCASH'  => 'mcash', 'GENIE'  => 'other',
            'BANK'   => 'bank_transfer', 'OTHER' => 'other',
        ];

        $method = $methodMap[strtoupper($payload['method'] ?? 'OTHER')] ?? 'other';

        DB::transaction(function () use ($payments, $payload, $statusCode, $method): void {
            foreach ($payments as $payment) {
                match ($statusCode) {
                    2       => $this->markPaymentCompleted($payment, $payload, $method),
                    0       => $payment->update(['status' => 'pending',  'method' => $method, 'gateway_response' => $payload]),
                    default => $payment->update(['status' => 'failed',   'method' => $method, 'gateway_response' => $payload]),
                };
            }
        });
    }

    private function markPaymentCompleted(Payment $payment, array $payload, string $method): void
    {
        $now = now()->timezone('Asia/Colombo');

        $payment->update([
            'status'             => 'completed',
            'method'             => $method,
            'payhere_payment_id' => $payload['payment_id'] ?? null,
            'gateway_response'   => $payload,
            'paid_at'            => $now,
        ]);

        $booking = $payment->booking()->with('course.tutorProfile')->first();
        $booking->increment('amount_paid', $payment->amount);
        $booking->fresh()->recalculatePaymentStatus();

        // Create tutor payout record
        $commissionRate   = (float) env('PLATFORM_COMMISSION_RATE', 10);
        $commissionAmount = round($payment->amount * $commissionRate / 100, 2);
        $netAmount        = round($payment->amount - $commissionAmount, 2);

        $tutorProfileId = $booking->course->tutorProfile->id;

        TutorPayout::create([
            'tutor_profile_id'  => $tutorProfileId,
            'payment_id'        => $payment->id,
            'gross_amount'      => $payment->amount,
            'commission_rate'   => $commissionRate,
            'commission_amount' => $commissionAmount,
            'net_amount'        => $netAmount,
            'status'            => 'pending',
        ]);

        Log::info('Payment completed + payout created', [
            'order_id'   => $payment->payhere_order_id,
            'booking_id' => $booking->id,
            'net_amount' => $netAmount,
        ]);
    }
}
