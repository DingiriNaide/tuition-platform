<?php

use App\Http\Controllers\ProfileController\StudentProfileController;
use App\Http\Controllers\ProfileController\TutorProfileController;
use App\Http\Controllers\ProfileController\ParentProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Admin\TutorVerificationController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\BookingController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return Inertia\Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // ── Courses (public within auth) ──────────────────────────────────
    Route::get('/courses', [CourseController::class, 'index'])->name('courses.index');
    Route::get('/courses/{course}', [CourseController::class, 'show'])->name('courses.show');

    // ── Courses (tutor/admin only) ────────────────────────────────────
    Route::middleware('role:tutor|admin|super-admin')->group(function () {
        Route::get('/courses/create', [CourseController::class, 'create'])->name('courses.create');
        Route::post('/courses', [CourseController::class, 'store'])->name('courses.store');
        Route::get('/courses/{course}/edit', [CourseController::class, 'edit'])->name('courses.edit');
        Route::put('/courses/{course}', [CourseController::class, 'update'])->name('courses.update');
        Route::delete('/courses/{course}', [CourseController::class, 'destroy'])->name('courses.destroy');
    });

    // ── Schedules (tutor/admin only) ──────────────────────────────────
    Route::middleware('role:tutor|admin|super-admin')->group(function () {
        Route::get('/schedules', [ScheduleController::class, 'index'])->name('schedules.index');
        Route::get('/schedules/create', [ScheduleController::class, 'create'])->name('schedules.create');
        Route::post('/schedules', [ScheduleController::class, 'store'])->name('schedules.store');
        Route::get('/schedules/{schedule}/edit', [ScheduleController::class, 'edit'])->name('schedules.edit');
        Route::put('/schedules/{schedule}', [ScheduleController::class, 'update'])->name('schedules.update');
        Route::delete('/schedules/{schedule}', [ScheduleController::class, 'destroy'])->name('schedules.destroy');
        Route::get('/tutor/bookings', [BookingController::class, 'tutorBookings'])->name('tutor.bookings');
        Route::post('/bookings/{booking}/confirm', [BookingController::class, 'confirm'])->name('bookings.confirm');
    });

    // ── Bookings (student only) ───────────────────────────────────────
    Route::middleware('role:student')->group(function () {
        Route::get('/bookings', [BookingController::class, 'index'])->name('bookings.index');
        Route::get('/bookings/create', [BookingController::class, 'create'])->name('bookings.create');
        Route::post('/bookings', [BookingController::class, 'store'])->name('bookings.store');
        Route::post('/bookings/{booking}/cancel', [BookingController::class, 'cancel'])->name('bookings.cancel');
    });

    // ── Booking detail (all roles) ────────────────────────────────────
    Route::get('/bookings/{booking}', [BookingController::class, 'show'])->name('bookings.show');

    // ── Admin ─────────────────────────────────────────────────────────
    Route::prefix('admin')->name('admin.')->middleware('role:admin|super-admin')->group(function () {
        Route::get('tutors', [TutorVerificationController::class, 'index'])->name('tutors.index');
        Route::get('tutors/{tutorProfile}', [TutorVerificationController::class, 'show'])->name('tutors.show');
        Route::post('tutors/{tutorProfile}/approve', [TutorVerificationController::class, 'approve'])->name('tutors.approve');
        Route::post('tutors/{tutorProfile}/reject', [TutorVerificationController::class, 'reject'])->name('tutors.reject');
    });

    // ── Student profile ───────────────────────────────────────────────
    Route::prefix('profile/student')->name('student.profile.')->group(function () {
        Route::get('/', [StudentProfileController::class, 'show'])->name('show');
        Route::get('/create', [StudentProfileController::class, 'create'])->name('create');
        Route::post('/', [StudentProfileController::class, 'store'])->name('store');
        Route::get('/edit', [StudentProfileController::class, 'edit'])->name('edit');
        Route::put('/', [StudentProfileController::class, 'update'])->name('update');
    });

    // ── Tutor profile ─────────────────────────────────────────────────
    Route::prefix('profile/tutor')->name('tutor.profile.')->group(function () {
        Route::get('/', [TutorProfileController::class, 'show'])->name('show');
        Route::get('/create', [TutorProfileController::class, 'create'])->name('create');
        Route::post('/', [TutorProfileController::class, 'store'])->name('store');
        Route::get('/edit', [TutorProfileController::class, 'edit'])->name('edit');
        Route::put('/', [TutorProfileController::class, 'update'])->name('update');
    });

    // ── Parent profile ────────────────────────────────────────────────
    Route::prefix('profile/parent')->name('parent.profile.')->group(function () {
        Route::get('/', [ParentProfileController::class, 'show'])->name('show');
        Route::get('/create', [ParentProfileController::class, 'create'])->name('create');
        Route::post('/', [ParentProfileController::class, 'store'])->name('store');
        Route::get('/edit', [ParentProfileController::class, 'edit'])->name('edit');
        Route::put('/', [ParentProfileController::class, 'update'])->name('update');
    });

});

require __DIR__.'/settings.php';