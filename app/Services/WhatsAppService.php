<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    protected string $token;
    protected string $baseUrl = 'https://api.fonnte.com';

    public function __construct()
    {
        // FIX: Use config() instead of env() for production compatibility
        $this->token = config('services.fonnte.token', '');
    }

    /**
     * Send a WhatsApp message via Fonnte
     */
    public function sendMessage(string $target, string $message, string $fileUrl = null): bool
    {
        if (empty($this->token)) {
            Log::warning('WhatsApp Service: FONNTE_TOKEN is empty. Message to ' . $target . ' was not sent.');
            return false;
        }

        // Sanitize phone number (remove spaces, dashes, brackets)
        $target = preg_replace('/[\s\-\(\)]/', '', $target);

        $data = [
            'target' => $target,
            'message' => $message,
            'countryCode' => '62',
        ];

        if ($fileUrl) {
            $data['url'] = $fileUrl;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => $this->token
            ])->post("{$this->baseUrl}/send", $data);

            $result = $response->json();

            if ($response->successful() && isset($result['status']) && $result['status'] === true) {
                return true;
            }

            Log::error('Fonnte API Error: ' . json_encode($result));
            return false;

        } catch (\Exception $e) {
            Log::error('Fonnte Exception: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Send heartbeat ping to user
     */
    public function sendPing(string $target, string $userName): bool
    {
        $message = "Halo {$userName},\n\nSistem PesanTerakhir.id memastikan Anda baik-baik saja. Silakan klik link berikut untuk konfirmasi (Check-in) bulan ini:\n\n" . route('login') . "\n\nJika tidak ada respon, sistem akan menghitung mundur sesuai pengaturan masa tenggang Anda.";
        return $this->sendMessage($target, $message);
    }
}
