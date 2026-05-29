<?php

// database/migrations/xxxx_create_bookings_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('student_profile_id')
                  ->constrained('student_profiles')
                  ->cascadeOnDelete();
            $table->foreignId('course_id')
                  ->constrained('courses')
                  ->cascadeOnDelete();
            $table->foreignId('schedule_id')
                  ->constrained('schedules')
                  ->cascadeOnDelete();
            $table->enum('status', [
                'pending',      // awaiting tutor confirmation
                'confirmed',    // tutor confirmed
                'cancelled',    // cancelled by either party
                'completed',    // all sessions done
            ])->default('pending');
            $table->enum('payment_status', [
                'unpaid',
                'paid',
                'refunded',
                'partial',
            ])->default('unpaid');
            $table->enum('billing_type', [
                'per_session',
                'monthly',
            ]);
            $table->decimal('amount_due', 10, 2)->default(0);
            $table->decimal('amount_paid', 10, 2)->default(0);
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->text('notes')->nullable();         // student notes on booking
            $table->text('cancellation_reason')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();

            $table->index(['student_profile_id', 'status']);
            $table->index(['course_id', 'status']);
            $table->index(['schedule_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
