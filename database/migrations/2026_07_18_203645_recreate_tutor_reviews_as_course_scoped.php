<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('tutor_reviews');

        Schema::create('tutor_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tutor_profile_id')->constrained()->cascadeOnDelete(); // denormalized for fast tutor-wide aggregation
            $table->foreignId('student_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('rating');
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->unique(['course_id', 'student_profile_id']); // one review per student per course
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tutor_reviews');
    }
};
