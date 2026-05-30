<?php

// database/migrations/xxxx_create_attendance_records_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance_records', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('booking_session_id')
                  ->constrained('booking_sessions')
                  ->cascadeOnDelete();
            $table->foreignId('booking_id')
                  ->constrained('bookings')
                  ->cascadeOnDelete();
            $table->foreignId('student_profile_id')
                  ->constrained('student_profiles')
                  ->cascadeOnDelete();
            $table->foreignId('tutor_profile_id')
                  ->constrained('tutor_profiles')
                  ->cascadeOnDelete();
            $table->enum('status', [
                'present',
                'absent',
                'late',
                'excused',
            ])->default('present');
            $table->unsignedSmallInteger('minutes_late')->default(0);
            $table->text('tutor_notes')->nullable();
            $table->timestamp('marked_at')->nullable();
            $table->timestamps();

            $table->unique('booking_session_id'); // one record per session
            $table->index(['student_profile_id', 'status']);
            $table->index(['tutor_profile_id', 'marked_at']);
            $table->index('booking_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_records');
    }
};
