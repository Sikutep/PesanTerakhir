<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\Middleware\RateLimited;
use App\Models\MessageRecipient;
use App\Models\Message;
use App\Services\WhatsAppService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SendWhatsAppMessageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [5, 10, 30];

    protected ?int $recipientId;
    protected string $text;
    protected ?int $messageId;
    protected ?string $targetPhone;

    /**
     * Create a new job instance.
     */
    public function __construct(string $text, ?int $recipientId = null, ?int $messageId = null, ?string $targetPhone = null)
    {
        $this->text = $text;
        $this->recipientId = $recipientId;
        $this->messageId = $messageId;
        $this->targetPhone = $targetPhone;
    }

    /**
     * Constructor overload for raw phone target (e.g. Ping, Guardian alert)
     */
    public static function forPhone(string $phone, string $text): self
    {
        return new self($text, null, null, $phone);
    }

    /**
     * Constructor overload for MessageRecipient
     */
    public static function forRecipient(int $recipientId, int $messageId, string $text): self
    {
        return new self($text, $recipientId, $messageId, null);
    }

    /**
     * Get the middleware the job should pass through.
     */
    public function middleware(): array
    {
        return [new RateLimited('fonnte')];
    }

    /**
     * Execute the job.
     */
    public function handle(WhatsAppService $waService): void
    {
        // Case 1: Raw Phone Target (Guardian Alert / Ping)
        if ($this->targetPhone) {
            $success = $waService->sendMessage($this->targetPhone, $this->text);
            if (!$success) {
                throw new \Exception("Failed to send WhatsApp message to {$this->targetPhone}");
            }
            return;
        }

        // Case 2: MessageRecipient Target
        if ($this->recipientId) {
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

            // Check if all recipients for this message are processed (prevent race condition with DB Transaction)
            if ($this->messageId) {
                DB::transaction(function () {
                    // Use lockForUpdate to prevent race conditions when multiple jobs finish at the exact same time
                    $message = Message::where('id', $this->messageId)->lockForUpdate()->first();
                    
                    if ($message && $message->status !== 'dispatched') {
                        $totalRecipients = $message->recipients()->count();
                        $processedRecipients = $message->recipients()->whereIn('status', ['sent', 'failed'])->count();

                        if ($totalRecipients > 0 && $totalRecipients === $processedRecipients) {
                            $message->update(['status' => 'dispatched']);
                        }
                    }
                });
            }
        }
    }

    public function failed(\Throwable $exception)
    {
        if ($this->recipientId) {
            $recipient = MessageRecipient::find($this->recipientId);
            if ($recipient) {
                $recipient->update([
                    'status' => 'failed',
                    'failed_reason' => substr($exception->getMessage(), 0, 1000)
                ]);
            }
        }
    }
}
