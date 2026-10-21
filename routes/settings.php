<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\ProfileDetailsController;
use App\Http\Controllers\Settings\ProfileMediaController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use App\Http\Controllers\Academic\Settings\InternshipSettingController;
use App\Http\Controllers\Academic\Settings\DocumentSettingController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');

    Route::post('settings/profile/media', [ProfileMediaController::class, 'update'])->name('profile.media.update');
    Route::patch('settings/profile/details', [ProfileDetailsController::class, 'update'])->name('profile.details.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('user-password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('identity/settings/appearance');
    })->name('appearance.edit');

    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');

    Route::get('settings/about', function () {
        return Inertia::render('identity/settings/about');
    })->name('settings.about');
});

// Academic Settings
Route::middleware(['auth', 'type:1,2', 'approved', 'role:1,2,3'])
    ->name('settings.academic.')
    ->prefix('settings')
    ->group(function () {
        Route::get('internship', [InternshipSettingController::class, 'index'])->name('internship');
        Route::get('document', [DocumentSettingController::class, 'index'])->name('document');
        Route::post('document', [DocumentSettingController::class, 'store'])->name('document.store');
        Route::put('document/{document}', [DocumentSettingController::class, 'update'])->name('document.update');
        Route::delete('document/{document}', [DocumentSettingController::class, 'destroy'])->name('document.destroy');
    });
