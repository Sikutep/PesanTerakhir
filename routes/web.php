<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\SubscriptionController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
});

// FIX #2: Public recipient route (no auth required, uses Signed URL)
Route::get('/pesan/{message}', [MessageController::class, 'recipientView'])->name('recipient.public')->middleware('signed');
Route::post('/pesan/{message}/verify-pin', [MessageController::class, 'verifyPin'])->name('recipient.verifyPin')->middleware(['signed', 'throttle:5,1']);

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('/dashboard/checkin', [DashboardController::class, 'checkIn'])->name('dashboard.checkin');
    
    Route::post('/messages', [MessageController::class, 'store'])->name('messages.store')->middleware('throttle:10,1');
    Route::put('/messages/{message}', [MessageController::class, 'update'])->name('messages.update');
    Route::delete('/messages/{message}', [MessageController::class, 'destroy'])->name('messages.destroy');
    
    // Owner preview (auth required)
    Route::get('/recipient/preview/{message}', [MessageController::class, 'preview'])->name('recipient.preview');
    
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings');
    Route::patch('/settings', [SettingsController::class, 'update'])->name('settings.update');
    Route::post('/settings/emergency', [SettingsController::class, 'emergencyOverride'])->name('settings.emergency');
    
    Route::get('/subscription', [SubscriptionController::class, 'index'])->name('subscription');
    Route::post('/subscription/simulate', [SubscriptionController::class, 'simulatePayment'])->name('subscription.simulate');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
