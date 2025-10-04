<?php

use App\Http\Controllers\PaymentController;
use App\Http\Controllers\StudentController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Student Management Routes
    Route::resource('students', StudentController::class)->middleware('permission:view students');

    // Payment Processing Routes
    Route::resource('payments', PaymentController::class)
        ->except(['edit', 'update'])
        ->middleware('permission:view payments');
    Route::post('payments/{payment}/print', [PaymentController::class, 'print'])
        ->name('payments.print')
        ->middleware('permission:print receipts');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
