<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Subscription;

class SubscriptionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $subscription = Subscription::where('user_id', $user->id)
            ->where(function($q) {
                $q->where('active_until', '>=', now())
                  ->orWhere('is_lifetime', true);
            })->latest()->first();

        return Inertia::render('Subscription', [
            'activeSubscription' => $subscription,
        ]);
    }

    public function simulatePayment(Request $request)
    {
        // For Sekali Bayar, just create a lifetime subscription
        Subscription::create([
            'user_id' => $request->user()->id,
            'plan_id' => 'lifetime',
            'is_lifetime' => true,
            'active_until' => null,
        ]);

        return back()->with('success', 'Pembayaran berhasil! Akses selamanya ke Ruang Kenangan Anda telah aktif.');
    }
}
