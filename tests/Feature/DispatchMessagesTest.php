<?php

namespace Tests\Feature;

use App\Models\Message;
use App\Models\MessageRecipient;
use App\Models\User;
use App\Models\CheckIn;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use App\Jobs\SendWhatsAppMessageJob;
use Carbon\Carbon;
use Tests\TestCase;

class DispatchMessagesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Prevent microsecond differences when saving/loading from DB
        Carbon::setTestNow(Carbon::now()->startOfSecond());
    }

    public function test_it_dispatches_messages_when_trigger_days_exceeded()
    {
        Queue::fake();

        $user = User::factory()->create([
            'created_at' => Carbon::now()->subDays(31),
            'grace_period_enabled' => false,
        ]);

        $message = Message::create([
            'user_id' => $user->id,
            'trigger_days' => 30,
            'status' => 'active',
        ]);

        $recipient = MessageRecipient::create([
            'message_id' => $message->id,
            'name' => 'Test Recipient',
            'wa_number' => '081111111111',
            'relationship' => 'Sahabat',
        ]);

        $this->artisan('app:dispatch-messages')->assertSuccessful();

        Queue::assertPushed(SendWhatsAppMessageJob::class, function ($job) use ($recipient) {
            return $job->recipientId === $recipient->id;
        });

        // The recipient status should be updated to pending
        $this->assertEquals('pending', $recipient->fresh()->status);
    }

    public function test_it_sends_warning_to_guardian_3_days_before_trigger()
    {
        Queue::fake();

        $user = User::factory()->create([
            'created_at' => Carbon::now()->subDays(27),
            'guardian_contact' => '081234567890',
            'grace_period_enabled' => false,
        ]);

        $message = Message::create([
            'user_id' => $user->id,
            'trigger_days' => 30, // 30 - 3 = 27 days
            'status' => 'active',
        ]);

        $recipient = MessageRecipient::create([
            'message_id' => $message->id,
            'name' => 'Test Recipient',
            'wa_number' => '081111111111',
            'relationship' => 'Sahabat',
        ]);

        $this->artisan('app:dispatch-messages')->assertSuccessful();

        // Should push a job for the guardian
        Queue::assertPushed(SendWhatsAppMessageJob::class, function ($job) {
            return $job->recipientId === null && $job->targetPhone === '081234567890' && str_contains($job->text, 'Peringatan Dini');
        });

        // Should NOT push a job for the recipient yet
        Queue::assertNotPushed(SendWhatsAppMessageJob::class, function ($job) {
            return $job->recipientId !== null;
        });
    }

    public function test_it_does_not_dispatch_if_recently_checked_in()
    {
        Queue::fake();

        $user = User::factory()->create([
            'created_at' => Carbon::now()->subDays(35),
            'grace_period_enabled' => false,
        ]);

        CheckIn::create([
            'user_id' => $user->id,
            'checked_in_at' => Carbon::now()->subDays(5),
            'status' => 'success'
        ]);

        $message = Message::create([
            'user_id' => $user->id,
            'trigger_days' => 30,
            'status' => 'active',
        ]);

        $recipient = MessageRecipient::create([
            'message_id' => $message->id,
            'name' => 'Test Recipient',
            'wa_number' => '081111111111',
            'relationship' => 'Sahabat',
        ]);

        $this->artisan('app:dispatch-messages')->assertSuccessful();

        Queue::assertNothingPushed();
    }
}
