<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:heartbeat-ping')]
#[Description('Send monthly WhatsApp heartbeat ping to users')]
class HeartbeatPing extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(\App\Services\WhatsAppService $waService)
    {
        $users = \App\Models\User::whereNotNull('wa_number')->get();
        $sentCount = 0;

        foreach ($users as $user) {
            // In a real app, we check the ping_schedule and if a ping was already sent recently.
            // For now, we simulate sending to everyone.
            $success = $waService->sendPing($user->wa_number, $user->name);
            if ($success) $sentCount++;
        }

        $this->info("Heartbeat ping sent to {$sentCount} users.");
    }
}
