<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tutor_profile_id')
                  ->constrained('tutor_profiles')
                  ->cascadeOnDelete();
            $table->foreignId('subject_id')
                  ->constrained('subjects')
                  ->cascadeOnDelete();
            $table->string('title');
            $table->string('title_sinhala')->nullable();
            $table->string('title_tamil')->nullable();
            $table->text('description')->nullable();
            $table->text('description_sinhala')->nullable();
            $table->text('description_tamil')->nullable();
            $table->enum('grade', [
                'grade_6', 'grade_7', 'grade_8', 'grade_9', 'grade_10', 'grade_11',
                'grade_12', 'grade_13', 'foundation',
            ]);
            $table->enum('syllabus', ['ol', 'al', 'foundation', 'general']);
            $table->enum('medium', ['sinhala', 'tamil', 'english', 'bilingual']);
            $table->decimal('price_per_session', 10, 2)->nullable();
            $table->decimal('price_monthly', 10, 2)->nullable();
            $table->unsignedSmallInteger('max_students')->default(30);
            $table->boolean('is_group')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['tutor_profile_id', 'is_active']);
            $table->index(['subject_id', 'syllabus', 'medium']);
            $table->index('grade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};