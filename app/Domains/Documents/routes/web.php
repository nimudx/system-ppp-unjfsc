<?php

use App\Domains\Documents\Http\Controllers\DocumentSettingController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'type:1,2', 'approved', 'role:1,2,3'])
    ->name('settings.academic.')
    ->prefix('settings')
    ->group(function () {
        Route::get('document', [DocumentSettingController::class, 'index'])->name('document');
        Route::post('document', [DocumentSettingController::class, 'store'])->name('document.store');
        Route::put('document/{document}', [DocumentSettingController::class, 'update'])->name('document.update');
        Route::delete('document/{document}', [DocumentSettingController::class, 'destroy'])->name('document.destroy');
    });
