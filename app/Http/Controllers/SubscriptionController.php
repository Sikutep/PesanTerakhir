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
        $validated = $request->validate([
            'plan' => 'required|string|in:annual,five_year,lifetime',
        ]);

        $planMap = [
            'annual' => ['amount' => 49000, 'lifetime' => false, 'until' => now()->addYear()],
            'five_year' => ['amount' => 149000, 'lifetime' => false, 'until' => now()->addYears(5)],
            'lifetime' => ['amount' => 299000, 'lifetime' => true, 'until' => null],
        ];

        $plan = $planMap[$validated['plan']];

        Subscription::create([
            'user_id' => $request->user()->id,
            'plan_id' => $validated['plan'],
            'is_lifetime' => $plan['lifetime'],
            'active_until' => $plan['until'],
        ]);

        return back()->with('success', 'Pembayaran berhasil! Brankas Anda telah diupgrade.');
    }
}
