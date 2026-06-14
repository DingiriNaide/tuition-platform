<?php

// database/migrations/xxxx_create_live_sessions_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('live_sessions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('booking_session_id')
                  ->constrained('booking_sessions')
                  ->cascadeOnDelete();
            $table->foreignId('course_id')
                  ->constrained('courses')
                  ->cascadeOnDelete();
            $table->foreignId('tutor_profile_id')
                  ->constrained('tutor_profiles')
                  ->cascadeOnDelete();
            $table->string('channel_name')->unique(); // Reverb channel identifier
            $table->enum('status', [
                'waiting',   // tutor created, waiting for students
                'live',      // session in progress
                'ended',     // session ended
            ])->default('waiting');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->unsignedSmallInteger('peak_participants')->default(0);
            $table->timestamps();

            $table->index(['booking_session_id', 'status']);
            $table->index(['channel_name', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('live_sessions');
    }
};
