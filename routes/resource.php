<?php

use App\Http\Controllers\ResourceController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'approved'])->group(function () {
    Route::get('/resource', [ResourceController::class, 'index'])->name('resource.index');
    Route::post('/resource', [ResourceController::class, 'store'])->name('resource.store');
    Route::put('/resource/{resource}', [ResourceController::class, 'update'])->name('resource.update');
    Route::delete('/resource/{resource}', [ResourceController::class, 'destroy'])->name('resource.destroy');
});
