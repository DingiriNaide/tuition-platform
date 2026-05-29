<?php

// database/migrations/xxxx_create_schedules_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedules', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tutor_profile_id')
                  ->constrained('tutor_profiles')
                  ->cascadeOnDelete();
            $table->foreignId('course_id')
                  ->constrained('courses')
                  ->cascadeOnDelete();
            $table->enum('day_of_week', [
                'monday','tuesday','wednesday',
                'thursday','friday','saturday','sunday',
            ])->nullable();                        // null = one-off date
            $table->date('specific_date')->nullable(); // for one-off sessions
            $table->time('start_time');
            $table->time('end_time');
            $table->boolean('is_recurring')->default(false);
            $table->date('recur_until')->nullable();
            $table->unsignedSmallInteger('max_students')->nullable(); // overrides course default
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['tutor_profile_id', 'is_active']);
            $table->index(['course_id', 'is_active']);
            $table->index('day_of_week');
            $table->index('specific_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
