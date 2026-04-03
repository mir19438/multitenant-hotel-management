<?php

use App\Http\Controllers\AssignManagerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HotelController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    // return Inertia::render('welcome');
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth'])->group(function () {
    // Route::get('dashboard', function () {
    //     return Inertia::render('dashboard');
    // })->name('dashboard');

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::resource('/hotels', HotelController::class)->only(['index', 'store', 'update','destroy']);

    Route::get('/managers',[AssignManagerController::class,'index'])->name('managers');
    Route::patch('/manager-assign/{id?}',[AssignManagerController::class,'assign'])->name('managers.assign');
    Route::patch('/manager-unassign/{id?}',[AssignManagerController::class,'unassign'])->name('managers.unassign');
    Route::patch('/toggle-active-inactive/{id?}',[AssignManagerController::class,'toggleActiveInactive'])->name('managers.toggleActiveInactive');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
