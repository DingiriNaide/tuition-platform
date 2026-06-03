<?php
// database/migrations/2025_01_01_000001_create_payments_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('booking_session_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('payhere_order_id')->unique()->nullable();
            $table->string('payhere_payment_id')->nullable();
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('LKR');
            $table->enum('status', ['pending', 'completed', 'failed', 'refunded'])->default('pending');
            $table->enum('method', ['card', 'bank_transfer', 'ezcash', 'mcash', 'other'])->nullable();
            $table->json('gateway_response')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['booking_id', 'status']);
            $table->index('payhere_order_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
