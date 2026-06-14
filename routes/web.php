<?php

use App\Http\Controllers\ProfileController\StudentProfileController;
use App\Http\Controllers\ProfileController\TutorProfileController;
use App\Http\Controllers\ProfileController\ParentProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Admin\TutorVerificationController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\ProgressReportController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\LiveSessionController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return Inertia\Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // ── Courses (public within auth) ──────────────────────────────────
    Route::get('/courses', [CourseController::class, 'index'])->name('courses.index');
    Route::get('/courses/create', [CourseController::class, 'create'])->name('courses.create');
    Route::get('/courses/{course}', [CourseController::class, 'show'])->name('courses.show');

    // ── Courses (tutor/admin only) ────────────────────────────────────
    Route::middleware('role:tutor|admin|super-admin')->group(function () {
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

// ── Attendance ────────────────────────────────────────────────────────

// Tutor: mark attendance for a session
Route::middleware(['auth', 'verified', 'role:tutor|admin|super-admin'])->group(function (): void {
    Route::get('/attendance/{bookingSession}/mark', [AttendanceController::class, 'mark'])
        ->name('attendance.mark');
    Route::post('/attendance/{bookingSession}', [AttendanceController::class, 'store'])
        ->name('attendance.store');
});

// Tutor + student + admin: view roster for a booking
Route::middleware(['auth', 'verified'])->group(function (): void {
    Route::get('/bookings/{booking}/attendance', [AttendanceController::class, 'bookingRoster'])
        ->name('attendance.roster');
});

// Student: own attendance summary
Route::middleware(['auth', 'verified', 'role:student'])->group(function (): void {
    Route::get('/attendance', [AttendanceController::class, 'studentSummary'])
        ->name('attendance.student');
});

// ── Progress Reports ──────────────────────────────────────────────────

// Tutor-only management
Route::middleware(['auth', 'verified', 'role:tutor|admin|super-admin'])->group(function (): void {
    Route::get('/progress-reports', [ProgressReportController::class, 'index'])
        ->name('progress-reports.index');
    Route::get('/bookings/{booking}/progress-reports/create', [ProgressReportController::class, 'create'])
        ->name('progress-reports.create');
    Route::post('/bookings/{booking}/progress-reports', [ProgressReportController::class, 'store'])
        ->name('progress-reports.store');
    Route::get('/progress-reports/{progressReport}/edit', [ProgressReportController::class, 'edit'])
        ->name('progress-reports.edit');
    Route::put('/progress-reports/{progressReport}', [ProgressReportController::class, 'update'])
        ->name('progress-reports.update');
});

// Student: own published reports
Route::middleware(['auth', 'verified', 'role:student'])->group(function (): void {
    Route::get('/my-progress', [ProgressReportController::class, 'studentReports'])
        ->name('progress-reports.student');
});

// Shared: view single report (auth guards applied inside controller)
Route::middleware(['auth', 'verified'])->group(function (): void {
    Route::get('/progress-reports/{progressReport}', [ProgressReportController::class, 'show'])
        ->name('progress-reports.show');
});

// ─── Payments ────────────────────────────────────────────────────────────────

// Student-facing (auth required)
Route::middleware(['auth', 'verified'])->group(function (): void {
    Route::get('/bookings/{booking}/pay', [PaymentController::class, 'initiate'])
        ->name('payments.initiate')
        ->middleware('role:student');

    Route::post('/payments/mock/checkout', [PaymentController::class, 'mockCheckout'])
        ->name('payments.mock.checkout');

    Route::post('/payments/mock/success', [PaymentController::class, 'mockSuccess'])
        ->name('payments.mock.success');

    Route::post('/payments/mock/fail', [PaymentController::class, 'mockFail'])
        ->name('payments.mock.fail');

    Route::get('/payments/return', [PaymentController::class, 'return'])
        ->name('payments.return');

    Route::get('/payments/cancel', [PaymentController::class, 'cancel'])
        ->name('payments.cancel');

    Route::get('/my-payments', [PaymentController::class, 'index'])
        ->name('payments.index');

    Route::post('/payments/{payment}/refund', [PaymentController::class, 'refund'])
        ->name('payments.refund')
        ->middleware('role:admin|super-admin|student');
});

// Webhook — NO auth, NO CSRF (PayHere posts server-to-server)
Route::post('/payments/webhook/payhere', [PaymentController::class, 'webhook'])
    ->name('payments.webhook')
    ->withoutMiddleware(['web', \Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class]);

// Tutor: create room from a booking session
Route::middleware(['auth', 'verified', 'role:tutor|admin|super-admin'])->group(function (): void {
    Route::post('/live-sessions', [LiveSessionController::class, 'store'])
         ->name('live-sessions.store');
    Route::post('/live-sessions/{liveSession}/start', [LiveSessionController::class, 'start'])
         ->name('live-sessions.start');
    Route::post('/live-sessions/{liveSession}/end', [LiveSessionController::class, 'end'])
         ->name('live-sessions.end');
});

// Shared: room view + signalling (tutor + student)
Route::middleware(['auth', 'verified'])->group(function (): void {
    Route::get('/live-sessions/{liveSession}', [LiveSessionController::class, 'show'])
         ->name('live-sessions.show');
    Route::post('/live-sessions/{liveSession}/signal', [LiveSessionController::class, 'signal'])
         ->name('live-sessions.signal');
    Route::post('/live-sessions/{liveSession}/chat', [LiveSessionController::class, 'chat'])
         ->name('live-sessions.chat');
    Route::post('/live-sessions/{liveSession}/hand', [LiveSessionController::class, 'hand'])
         ->name('live-sessions.hand');
});

require __DIR__.'/settings.php';