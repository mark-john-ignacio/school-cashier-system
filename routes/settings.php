<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\FeeStructureController;
use App\Http\Controllers\Settings\GradeLevelController;
use App\Http\Controllers\Settings\SectionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');
});

Route::middleware('auth')->prefix('admin/academics')->name('academics.')->group(function () {
    Route::redirect('/', '/admin/academics/grade-levels')->name('home');

    Route::get('grade-levels', [GradeLevelController::class, 'index'])->name('grade-levels.index');
    Route::post('grade-levels', [GradeLevelController::class, 'store'])->name('grade-levels.store');
    Route::put('grade-levels/{gradeLevel}', [GradeLevelController::class, 'update'])->name('grade-levels.update');
    Route::delete('grade-levels/{gradeLevel}', [GradeLevelController::class, 'destroy'])->name('grade-levels.destroy');

    Route::post('sections', [SectionController::class, 'store'])->name('sections.store');
    Route::put('sections/{section}', [SectionController::class, 'update'])->name('sections.update');
    Route::delete('sections/{section}', [SectionController::class, 'destroy'])->name('sections.destroy');

    Route::get('fee-structures', [FeeStructureController::class, 'index'])->name('fee-structures.index');
    Route::post('fee-structures', [FeeStructureController::class, 'store'])->name('fee-structures.store');
    Route::put('fee-structures/{feeStructure}', [FeeStructureController::class, 'update'])->name('fee-structures.update');
    Route::delete('fee-structures/{feeStructure}', [FeeStructureController::class, 'destroy'])->name('fee-structures.destroy');
});
