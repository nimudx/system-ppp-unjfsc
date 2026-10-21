<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/registro-empresa', function () {
    return Inertia::render('company/register');
})->name('empresa.registro');
