<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\MessageRecipient;
use App\Models\Message;
use App\Services\WhatsAppService;
use Illuminate\Support\Facades\Log;

class SendWhatsAppMessageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [5, 10, 30]; // Exponential backoff in seconds

    protected $recipientId;
    protected $text;
    protected $messageId;
    protected $isPing;

    /**
     * Create a new job instance.
     */
    public function __construct(int $recipientId, string $text, ?int $messageId = null, bool $isPing = false)
    {
        $this->recipientId = $recipientId;
        $this->text = $text;
        $this->messageId = $messageId;
        $this->isPing = $isPing;
    }

    /**
     * Execute the job.
     */
    public function handle(WhatsAppService $waService): void
    {
        if ($this->isPing) {
            // For guardian alerts or pings, recipientId is just a dummy, and text is the target WA
            // Actually wait, let's keep recipientId as user_id for ping, or just don't use this job for raw ping.
            // Let's adjust constructor to support pure phone numbers if recipientId is 0.
        }

        if ($this->recipientId === 0) {
            // It's a raw guardian alert or ping where we passed the phone number in a different way.
            // Let's assume text is a JSON with target and message.
            $data = json_decode($this->text, true);
            $target = $data['target'];
            $msg = $data['message'];

            $success = $waService->sendMessage($target, $msg);
            if (!$success) {
                throw new \Exception("Failed to send WhatsApp message to {$target}");
            }
            return;
        }

        $recipient = MessageRecipient::find($this->recipientId);
        if (!$recipient) return;

        $success = $waService->sendMessage($recipient->wa_number, $this->text);

        if ($success) {
            $recipient->update([
                'status' => 'sent',
                'failed_reason' => null
            ]);
        } else {
            $recipient->update([
                'status' => 'failed',
                'failed_reason' => 'WhatsApp API rejected the message or timed out'
            ]);
            throw new \Exception("Failed to send WhatsApp message to {$recipient->wa_number}");
        }

        // Check if all recipients for this message are processed
        if ($this->messageId) {
            $message = Message::find($this->messageId);
            if ($message) {
                $totalRecipients = $message->recipients()->count();
                $processedRecipients = $message->recipients()->whereIn('status', ['sent', 'failed'])->count();

                if ($totalRecipients === $processedRecipients) {
                    $message->update(['status' => 'dispatched']);
                }
            }
        }
    }

    public function failed(\Throwable $exception)
    {
        if ($this->recipientId !== 0) {
            $recipient = MessageRecipient::find($this->recipientId);
            if ($recipient) {
                $recipient->update([
                    'status' => 'failed',
                    'failed_reason' => $exception->getMessage()
                ]);
            }
        }
    }
}
