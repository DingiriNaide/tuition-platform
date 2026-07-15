<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('assignment_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_profile_id')->constrained()->cascadeOnDelete();
            $table->text('text_answer')->nullable();
            $table->json('objective_answers')->nullable();
            $table->unsignedInteger('auto_graded_score')->nullable();
            $table->unsignedInteger('final_score')->nullable();
            $table->text('tutor_feedback')->nullable();
            $table->enum('status', ['pending', 'submitted', 'graded', 'late'])->default('pending');
            $table->dateTime('submitted_at')->nullable();
            $table->dateTime('graded_at')->nullable();
            $table->timestamps();

            $table->unique(['assignment_id', 'student_profile_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assignment_submissions');
    }
};
