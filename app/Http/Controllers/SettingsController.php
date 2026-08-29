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

        if (empty($user->wa_number)) {
            return back()->with('error', 'Gagal simulasi: Nomor WhatsApp Anda belum diatur.');
        }

        $count = $messages->count();
        $sampleRecipient = $messages->first()->recipients()->first();
        $recipientName = $sampleRecipient ? $sampleRecipient->name : '[Nama Penerima]';

        $text = "PesanTerakhir.id — [MODE SIMULASI]\n\nHalo {$recipientName},\n\nSeseorang bernama {$user->name} telah meninggalkan pesan rahasia untuk Anda. Ini adalah *contoh* tampilan pesan jika Anda gagal merespons sistem melewati masa tenggang.\n\nLink rahasia akan dilampirkan di sini, dan sistem akan mengamankannya dengan Pertanyaan Keamanan/PIN jika Anda mengaturnya.\n\nSimulasi selesai.";
        
        try {
            \App\Jobs\SendWhatsAppMessageJob::dispatchSync($text, null, null, $user->wa_number);
        } catch (\Exception $e) {
            return back()->with('error', 'Simulasi gagal dikirim via WhatsApp. Pastikan token valid dan nomor Anda benar.');
        }

        return back()->with('success', "Simulasi berhasil! Contoh pesan telah dikirimkan ke WhatsApp Anda ({$user->wa_number}).");
    }
}
