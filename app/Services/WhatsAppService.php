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

        $target = $this->sanitizePhone($target);

        $data = [
            'target' => $target,
            'message' => $message,
            'countryCode' => '62',
        ];

        if ($fileUrl) {
            $data['url'] = $fileUrl;
        }

        try {
            // Note: Fonnte API requires the token directly in the Authorization header,
            // NOT prefixed with 'Bearer '. Thus, we use withHeaders instead of withToken().
            $response = Http::timeout(10)->retry(3, 100)->withHeaders([
                'Authorization' => $this->token
            ])->post("{$this->baseUrl}/send", $data);

            $result = $response->json();

            if ($response->successful() && isset($result['status']) && $result['status'] === true) {
                Log::info("WhatsApp message sent successfully to {$target}");
                return true;
            }

            Log::error("Fonnte API Error for {$target}: " . json_encode($result));
            return false;

        } catch (\Exception $e) {
            Log::error("Fonnte Exception for {$target}: " . $e->getMessage());
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

    /**
     * Sanitize phone number to E.164-like format (without +)
     */
    public function sanitizePhone(string $phone): string
    {
        // Remove spaces, dashes, brackets, and +
        $phone = preg_replace('/[\s\-\(\)\+]/', '', $phone);
        
        // Convert 08... to 628...
        if (str_starts_with($phone, '0')) {
            $phone = '62' . substr($phone, 1);
        }

        return $phone;
    }
}
