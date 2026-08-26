<?php

use App\Http\Controllers\Academic\InternshipController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\Academic\InternshipGroupController;
use App\Http\Controllers\Academic\SupervisionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/documents/upload', [DocumentController::class , 'store']);
Route::patch('documents/{document}/status', [DocumentController::class , 'updateStatus']);

Route::post('internship-groups', [InternshipGroupController::class , 'store']);
Route::post('internship-groups/{group}/students', [InternshipGroupController::class , 'attachStudents']);
Route::delete('internship-groups/{group}/students/remove', [InternshipGroupController::class , 'detachStudents']);
Route::post('internship-groups/{group}/students/move', [InternshipGroupController::class , 'moveStudents']);

Route::post('supervisions/{supervision}/evaluation', [SupervisionController::class , 'storeEvaluation']);
Route::patch('supervisions/{evaluation}/status', [SupervisionController::class , 'updateEvaluationStatus']);


Route::post('internships/document/store', [InternshipController::class , 'storeDocumentInternship']);
Route::post('internships/{assignment}/store', [InternshipController::class , 'store']);
Route::patch('internships/{document}/status', [InternshipController::class , 'updateInternshipStatus']);