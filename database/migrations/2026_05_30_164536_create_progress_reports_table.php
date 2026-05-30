<?php

// database/migrations/xxxx_create_progress_reports_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('progress_reports', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('booking_id')
                  ->constrained('bookings')
                  ->cascadeOnDelete();
            $table->foreignId('student_profile_id')
                  ->constrained('student_profiles')
                  ->cascadeOnDelete();
            $table->foreignId('tutor_profile_id')
                  ->constrained('tutor_profiles')
                  ->cascadeOnDelete();
            $table->foreignId('course_id')
                  ->constrained('courses')
                  ->cascadeOnDelete();
            // Tutor assessment fields
            $table->enum('overall_grade', [
                'excellent',    // 90–100
                'good',         // 75–89
                'satisfactory', // 60–74
                'needs_work',   // 45–59
                'poor',         // below 45
            ])->nullable();
            $table->unsignedTinyInteger('score')->nullable(); // 0–100
            $table->text('strengths')->nullable();
            $table->text('areas_for_improvement')->nullable();
            $table->text('tutor_comments')->nullable();
            $table->text('recommended_actions')->nullable();
            // Period this report covers
            $table->date('period_start');
            $table->date('period_end');
            // Attendance summary snapshot
            $table->unsignedSmallInteger('total_sessions')->default(0);
            $table->unsignedSmallInteger('attended_sessions')->default(0);
            $table->unsignedSmallInteger('absent_sessions')->default(0);
            $table->unsignedSmallInteger('late_sessions')->default(0);
            // Parent/student visibility
            $table->boolean('is_published')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->index(['student_profile_id', 'is_published']);
            $table->index(['tutor_profile_id', 'period_start']);
            $table->index(['booking_id', 'period_start']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('progress_reports');
    }
};
