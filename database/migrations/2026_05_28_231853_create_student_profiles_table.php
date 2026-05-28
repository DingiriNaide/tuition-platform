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
        Schema::create('student_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('full_name');
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->string('phone')->nullable();
            $table->string('school')->nullable();
            $table->enum('grade', ['grade_6','grade_7','grade_8','grade_9','grade_10','grade_11','al_1','al_2','al_3','foundation'])->nullable();
            $table->enum('medium', ['sinhala', 'tamil', 'english'])->default('english');
            $table->string('district')->nullable();
            $table->string('city')->nullable();
            $table->boolean('is_low_income')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_profiles');
    }
};
