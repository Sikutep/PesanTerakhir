<?php

namespace Tests\Feature;

use App\Services\WhatsAppService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class WhatsAppServiceTest extends TestCase
{
    public function test_send_message_successful()
    {
        config(['services.fonnte.token' => 'test-token']);
        
        Http::fake([
            'api.fonnte.com/send' => Http::response(['status' => true], 200)
        ]);

        $service = new WhatsAppService();
        $result = $service->sendMessage('081234567890', 'Test Message');

        $this->assertTrue($result);

        Http::assertSent(function ($request) {
            return $request->url() == 'https://api.fonnte.com/send' &&
                   $request['target'] == '6281234567890' &&
                   $request['message'] == 'Test Message' &&
                   $request->header('Authorization')[0] == 'test-token';
        });
    }

    public function test_send_message_handles_http_errors_gracefully()
    {
        config(['services.fonnte.token' => 'test-token']);
        
        // Mock a failure response
        Http::fake([
            'api.fonnte.com/send' => Http::response(['status' => false, 'reason' => 'Invalid token'], 401)
        ]);

        $service = new WhatsAppService();
        $result = $service->sendMessage('081234567890', 'Test Message');

        $this->assertFalse($result);
    }

    public function test_send_message_handles_connection_exceptions()
    {
        config(['services.fonnte.token' => 'test-token']);
        
        // Mock a connection exception (like cURL error 6)
        Http::fake(function ($request) {
            throw new \Illuminate\Http\Client\ConnectionException('cURL error 6: Could not resolve host');
        });

        $service = new WhatsAppService();
        
        Log::shouldReceive('error')->once()->withArgs(function($message) {
            return str_contains($message, 'Fonnte Exception for 6281234567890: cURL error 6: Could not resolve host');
        });

        $result = $service->sendMessage('081234567890', 'Test Message');

        $this->assertFalse($result);
    }
}
