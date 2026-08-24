<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Settings', [
            'auth' => [
                'user' => $request->user(),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'wa_number' => 'nullable|string|max:20',
            'guardian_contact' => 'nullable|string|max:20',
            // FIX #4: Accept both cases
            'ping_schedule' => 'required|string',
            'grace_period_enabled' => 'required|boolean',
        ]);

        // Normalize ping_schedule to lowercase
        $validated['ping_schedule'] = strtolower($validated['ping_schedule']);

        if (!in_array($validated['ping_schedule'], ['pagi', 'siang', 'malam'])) {
            return back()->withErrors(['ping_schedule' => 'Jadwal ping harus Pagi, Siang, atau Malam.']);
        }

        $request->user()->update($validated);

        return back()->with('success', 'Pengaturan berhasil diperbarui.');
    }

    public function emergencyOverride(Request $request)
    {
        $user = $request->user();
        $messages = $user->messages()->where('status', 'active')->with('recipients')->get();

        if ($messages->isEmpty()) {
            return back()->with('error', 'Tidak ada pesan aktif untuk dikirimkan.');
        }

        // Mark as simulation (don't actually dispatch via WA in simulation mode)
        $count = $messages->count();

        return back()->with('success', "Simulasi darurat berhasil! {$count} pesan telah disimulasikan pengirimannya ke kontak tujuan.");
    }
}
