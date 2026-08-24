<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use App\Models\User;
use App\Models\CheckIn;
use App\Jobs\SendWhatsAppMessageJob;
use Carbon\Carbon;

#[Signature('app:heartbeat-ping')]
#[Description('Send WhatsApp heartbeat ping to users based on their schedule')]
class HeartbeatPing extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Determine current period (Pagi: 08:00, Siang: 13:00, Malam: 20:00)
        $hour = (int) now()->format('H');
        $schedule = null;
        
        if ($hour >= 7 && $hour <= 10) $schedule = 'pagi';
        elseif ($hour >= 12 && $hour <= 15) $schedule = 'siang';
        elseif ($hour >= 19 && $hour <= 22) $schedule = 'malam';

        if (!$schedule) {
            $this->info("Current hour {$hour} does not match any ping schedule window. Skipping.");
            return;
        }

        $sentCount = 0;

        // Process in chunks to prevent memory exhaustion
        User::whereNotNull('wa_number')
            ->where('ping_schedule', $schedule)
            ->chunkById(100, function ($users) use (&$sentCount) {
                
                foreach ($users as $user) {
                    // Check if user already checked in this month
                    $hasCheckedInThisMonth = CheckIn::where('user_id', $user->id)
                        ->where('status', 'success')
                        ->whereYear('checked_in_at', now()->year)
                        ->whereMonth('checked_in_at', now()->month)
                        ->exists();

                    if ($hasCheckedInThisMonth) {
                        continue; // Skip, they already checked in
                    }

                    $message = "Halo {$user->name},\n\nSistem PesanTerakhir.id memastikan Anda baik-baik saja. Silakan klik link berikut untuk konfirmasi (Check-in) bulan ini:\n\n" . route('login') . "\n\nJika tidak ada respon, sistem akan menghitung mundur sesuai pengaturan masa tenggang Anda.";
                    
                    SendWhatsAppMessageJob::forPhone($user->wa_number, $message)->dispatch();
                    $sentCount++;
                }
            });

        $this->info("Heartbeat ping queued for {$sentCount} users for schedule: {$schedule}.");
    }
}
