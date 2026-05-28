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
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('name_sinhala')->nullable();
            $table->string('name_tamil')->nullable();
            $table->string('slug')->unique();
            $table->enum('syllabus', ['ol', 'al', 'foundation', 'general'])->default('general');
            $table->enum('medium', ['sinhala', 'tamil', 'english', 'all'])->default('all');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subjects');
    }
};
