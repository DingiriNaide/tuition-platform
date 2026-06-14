<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    protected $fillable = [
        'code',
        'type',
        'value',
        'is_low_income_only',
        'max_uses',
        'times_used',
        'expires_at',
        'is_active',
    ];

    protected $casts = [
        'value'              => 'decimal:2',
        'is_low_income_only' => 'boolean',
        'is_active'          => 'boolean',
        'expires_at'         => 'datetime',
    ];

    public function isValid(?StudentProfile $student = null): bool
    {
        if (! $this->is_active) return false;
        if ($this->expires_at && $this->expires_at->isPast()) return false;
        if ($this->max_uses && $this->times_used >= $this->max_uses) return false;
        if ($this->is_low_income_only && $student && ! $student->is_low_income) return false;

        return true;
    }

    public function discountFor(float $amount): float
    {
        return $this->type === 'percentage'
            ? round($amount * $this->value / 100, 2)
            : min((float) $this->value, $amount);
    }
}