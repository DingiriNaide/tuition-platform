<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VoucherController extends Controller
{
    public function index(): Response
    {
        $vouchers = Voucher::latest()->paginate(20);

        return Inertia::render('Admin/Vouchers/Index', [
            'vouchers' => $vouchers,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code'               => ['required', 'string', 'max:50', 'unique:vouchers,code'],
            'type'               => ['required', 'in:percentage,fixed'],
            'value'              => ['required', 'numeric', 'min:1'],
            'is_low_income_only' => ['boolean'],
            'max_uses'           => ['nullable', 'integer', 'min:1'],
            'expires_at'         => ['nullable', 'date', 'after:today'],
        ]);

        $validated['code'] = strtoupper($validated['code']);

        Voucher::create($validated);

        return redirect()->back()->with('success', 'Voucher created.');
    }

    public function toggle(Voucher $voucher): RedirectResponse
    {
        $voucher->update(['is_active' => ! $voucher->is_active]);

        return redirect()->back()->with('success', 
            $voucher->is_active ? 'Voucher deactivated.' : 'Voucher activated.'
        );
    }

    public function destroy(Voucher $voucher): RedirectResponse
    {
        $voucher->delete();
        return redirect()->back()->with('success', 'Voucher deleted.');
    }
}