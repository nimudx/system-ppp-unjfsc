<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/bolsa', function () {
    return Inertia::render('jobboard/public/index');
})->name('bolsa.index');
