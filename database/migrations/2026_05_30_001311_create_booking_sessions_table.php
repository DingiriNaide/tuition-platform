<?php

// database/migrations/xxxx_create_booking_sessions_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_sessions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('booking_id')
                  ->constrained('bookings')
                  ->cascadeOnDelete();
            $table->foreignId('schedule_id')
                  ->constrained('schedules')
                  ->cascadeOnDelete();
            $table->date('session_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->enum('status', [
                'scheduled',
                'ongoing',
                'completed',
                'cancelled',
                'no_show',
            ])->default('scheduled');
            $table->boolean('student_attended')->default(false);
            $table->text('tutor_notes')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->timestamps();

            $table->index(['booking_id', 'status']);
            $table->index(['session_date', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_sessions');
    }
};
