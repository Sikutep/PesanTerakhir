<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\CheckIn;
use Illuminate\Support\Facades\URL;
use App\Jobs\SendWhatsAppMessageJob;

class DispatchMessages extends Command
{
    protected $signature = 'app:dispatch-messages';
    protected $description = 'Dispatch messages for users who have exceeded their trigger days';

    public function handle()
    {
        $dispatched = 0;

        // Use chunkById to prevent OOM
        User::whereHas('messages', function($q) {
            $q->where('status', 'active');
        })->chunkById(100, function ($users) use (&$dispatched) {
            
            foreach ($users as $user) {
                // Eager load messages for this specific user
                $user->load(['messages' => function($q) {
                    $q->where('status', 'active')->with('recipients');
                }]);

                if ($user->messages->isEmpty()) continue;

                $lastCheckIn = CheckIn::where('user_id', $user->id)
                    ->where('status', 'success')
                    ->latest('checked_in_at')
                    ->first();

                // Prevent dispatching for brand-new users
                $referenceDate = $lastCheckIn?->checked_in_at ?? $user->created_at;
                $daysSinceLastActivity = (int) ceil($referenceDate->floatDiffInDays(now()));

                $gracePeriodDays = $user->grace_period_enabled ? 7 : 0;

                foreach ($user->messages as $message) {
                    $totalTriggerDays = $message->trigger_days + $gracePeriodDays;

                    if ($daysSinceLastActivity >= $totalTriggerDays) {
                        
                        // Alert guardian first if configured
                        if ($user->guardian_contact) {
                            $guardianText = "⚠️ PesanTerakhir.id — Pemberitahuan Darurat\n\nHalo, Anda tercatat sebagai Kontak Wali untuk {$user->name}.\n\nYang bersangkutan tidak merespons check-in selama {$daysSinceLastActivity} hari. Sistem akan mulai mengirimkan pesan rahasia mereka ke penerima.\n\nJika ini kesalahan, segera hubungi yang bersangkutan.";
                            
                            SendWhatsAppMessageJob::forPhone($user->guardian_contact, $guardianText)->dispatch();
                        }

                        // Dispatch to recipients via Job Queue
                        foreach ($message->recipients as $recipient) {
                            // Update recipient status to pending before queueing
                            $recipient->update(['status' => 'pending']);

                            // Generate Signed URL expiring in 72 hours
                            $link = URL::signedRoute('recipient.public', ['message' => $message->id], now()->addHours(72));
                            
                            $text = "Pesan otomatis dari PesanTerakhir.id\n\nHalo {$recipient->name},\n\nSeseorang bernama {$user->name} telah meninggalkan pesan rahasia untuk Anda. Buka tautan berikut (berlaku 72 jam) untuk membaca:\n\n{$link}\n\n*Jika pesan ini dilindungi PIN, tanyakan pada kerabat bersangkutan.";

                            SendWhatsAppMessageJob::forRecipient($recipient->id, $message->id, $text)->dispatch();
                        }
                        
                        // Note: Message status is now updated inside the Job once all recipients are processed.
                        $dispatched++;
                    }
                }
            }
        });

        $this->info("Queued {$dispatched} message dispatch jobs.");
    }
}
