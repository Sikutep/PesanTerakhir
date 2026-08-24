<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\CheckIn;
use App\Models\Message;
use App\Services\WhatsAppService;

class DispatchMessages extends Command
{
    protected $signature = 'app:dispatch-messages';
    protected $description = 'Dispatch messages for users who have exceeded their trigger days';

    public function handle(WhatsAppService $waService)
    {
        // Eager-load to avoid N+1
        $users = User::with(['messages' => function($q) {
            $q->where('status', 'active')->with('recipients');
        }])->get();

        $dispatched = 0;

        foreach ($users as $user) {
            // Skip users with no active messages
            if ($user->messages->isEmpty()) continue;

            $lastCheckIn = CheckIn::where('user_id', $user->id)
                ->where('status', 'success')
                ->latest('checked_in_at')
                ->first();

            // FIX #1: Use user creation date as fallback instead of 999
            // This prevents dispatching messages for brand-new users
            $referenceDate = $lastCheckIn?->checked_in_at ?? $user->created_at;
            $daysSinceLastActivity = (int) ceil($referenceDate->floatDiffInDays(now()));

            // FIX: Check grace period before dispatching
            $gracePeriodDays = $user->grace_period_enabled ? 7 : 0;

            foreach ($user->messages as $message) {
                $totalTriggerDays = $message->trigger_days + $gracePeriodDays;

                if ($daysSinceLastActivity >= $totalTriggerDays) {
                    // FIX: Alert guardian first if configured
                    if ($user->guardian_contact) {
                        $guardianText = "⚠️ PesanTerakhir.id — Pemberitahuan Darurat\n\nHalo, Anda tercatat sebagai Kontak Wali untuk {$user->name}.\n\nYang bersangkutan tidak merespons check-in selama {$daysSinceLastActivity} hari. Sistem akan mengirimkan pesan rahasia mereka ke penerima yang ditentukan.\n\nJika ini kesalahan, segera hubungi yang bersangkutan.";
                        $waService->sendMessage($user->guardian_contact, $guardianText);
                    }

                    // Dispatch to recipients
                    foreach ($message->recipients as $recipient) {
                        // FIX #2: Use public token-based URL instead of auth-protected route
                        $link = url("/pesan/{$message->id}?token=" . hash('sha256', $message->id . $message->created_at));
                        $text = "Pesan otomatis dari PesanTerakhir.id\n\nHalo {$recipient->name},\n\nSeseorang bernama {$user->name} telah meninggalkan pesan rahasia untuk Anda. Buka tautan berikut untuk membaca:\n\n{$link}\n\n*Jika pesan ini dilindungi PIN, tanyakan pada kerabat bersangkutan.";

                        try {
                            $waService->sendMessage($recipient->wa_number, $text);
                        } catch (\Exception $e) {
                            $this->error("Failed to send to {$recipient->wa_number}: {$e->getMessage()}");
                        }
                    }
                    $message->update(['status' => 'dispatched']);
                    $dispatched++;
                }
            }
        }

        $this->info("Dispatched {$dispatched} messages.");
    }
}
