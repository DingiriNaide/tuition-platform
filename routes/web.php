<?php

use App\Http\Controllers\ProfileController\StudentProfileController;
use App\Http\Controllers\ProfileController\TutorProfileController;
use App\Http\Controllers\ProfileController\ParentProfileController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return Inertia\Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Student profile
    Route::prefix('profile/student')->name('student.profile.')->group(function () {
        Route::get('/', [StudentProfileController::class, 'show'])->name('show');
        Route::get('/create', [StudentProfileController::class, 'create'])->name('create');
        Route::post('/', [StudentProfileController::class, 'store'])->name('store');
        Route::get('/edit', [StudentProfileController::class, 'edit'])->name('edit');
        Route::put('/', [StudentProfileController::class, 'update'])->name('update');
    });

    // Tutor profile
    Route::prefix('profile/tutor')->name('tutor.profile.')->group(function () {
        Route::get('/', [TutorProfileController::class, 'show'])->name('show');
        Route::get('/create', [TutorProfileController::class, 'create'])->name('create');
        Route::post('/', [TutorProfileController::class, 'store'])->name('store');
        Route::get('/edit', [TutorProfileController::class, 'edit'])->name('edit');
        Route::put('/', [TutorProfileController::class, 'update'])->name('update');
    });

    // Parent profile
    Route::prefix('profile/parent')->name('parent.profile.')->group(function () {
        Route::get('/', [ParentProfileController::class, 'show'])->name('show');
        Route::get('/create', [ParentProfileController::class, 'create'])->name('create');
        Route::post('/', [ParentProfileController::class, 'store'])->name('store');
        Route::get('/edit', [ParentProfileController::class, 'edit'])->name('edit');
        Route::put('/', [ParentProfileController::class, 'update'])->name('update');
    });

});

require __DIR__.'/settings.php';