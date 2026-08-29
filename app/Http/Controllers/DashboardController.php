<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Message;
use App\Models\CheckIn;
use App\Models\MessageRecipient;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $lastCheckIn = CheckIn::where('user_id', $user->id)
            ->where('status', 'success')
            ->whereNotNull('checked_in_at')
            ->latest('checked_in_at')
            ->first();

        $totalCheckIns = CheckIn::where('user_id', $user->id)
            ->where('status', 'success')
            ->count();

        $firstCheckIn = CheckIn::where('user_id', $user->id)
            ->where('status', 'success')
            ->whereNotNull('checked_in_at')
            ->oldest('checked_in_at')
            ->first();

        $messages = Message::with('recipients')
            ->where('user_id', $user->id)
            ->get();

        $totalRecipients = MessageRecipient::whereIn('message_id', $messages->pluck('id'))->count();

        // FIX: Null-safe calculation with integer casting
        $triggerDays = (int) ($user->default_trigger_days ?: 60);
        $daysRemaining = $triggerDays;
        if ($lastCheckIn?->checked_in_at) {
            $daysSince = (int) ceil($lastCheckIn->checked_in_at->floatDiffInDays(now()));
            $daysRemaining = max(0, $triggerDays - $daysSince);
        }

        // FIX: Use actual trigger days for next check-in, null-safe
        $nextCheckIn = $lastCheckIn?->checked_in_at
            ? $lastCheckIn->checked_in_at->addDays($triggerDays)->format('j F Y')
            : now()->addDays($triggerDays)->format('j F Y');

        $mappedMessages = $messages->map(function ($msg) {
            $types = [];
            if ($msg->content_text) $types[] = 'Teks';
            if ($msg->content_audio_path) $types[] = 'Audio';
            if ($msg->content_video_path) $types[] = 'Video';
            if ($msg->content_file_path) $types[] = 'Dokumen';
            
            $recipient = $msg->recipients->first();

            return [
                'id' => (string) $msg->id,
                'recipient' => $recipient?->name ?? 'Unknown',
                'relationship' => $recipient?->relationship ?? '',
                'phone' => $recipient?->wa_number ?? '',
                'recipientEmail' => $recipient?->email ?? '',
                'types' => $types,
                'triggerDays' => (int) $msg->trigger_days,
                'createdAt' => $msg->created_at->format('d M Y'),
                'status' => $msg->status,
                'audioDuration' => $msg->content_audio_path ? 'Tersedia' : null,
                'messageText' => $msg->content_text ?? '',
                'hasAudio' => !empty($msg->content_audio_path),
                'hasVideo' => !empty($msg->content_video_path),
                'hasDocument' => !empty($msg->content_file_path),
                'securityQuestion' => $msg->security_question,
                'securityAnswer' => $msg->security_answer,
                'pin' => '',
            ];
        });

        $activeCount = $messages->where('status', 'active')->count();
        $draftCount = $messages->where('status', 'draft')->count();

        return Inertia::render('Dashboard', [
            'messages' => $mappedMessages,
            'stats' => [
                'totalMessages' => $messages->count(),
                'activeCount' => $activeCount,
                'draftCount' => $draftCount,
                'totalRecipients' => $totalRecipients,
                'daysRemaining' => $daysRemaining,
                'totalCheckIns' => $totalCheckIns,
                'firstCheckInDate' => $firstCheckIn?->checked_in_at?->format('M Y') ?? '-',
                'nextCheckIn' => $nextCheckIn,
                'intervalDays' => $triggerDays,
            ],
            'guardian' => [
                'name' => $user->guardian_contact ? 'Kontak Wali' : 'Belum diatur',
                'phone' => $user->guardian_contact ?? '-',
            ],
            'lastCheckIn' => $lastCheckIn,
            'subscription' => $user->subscriptions()
                ->where(function($q) {
                    $q->where('active_until', '>=', now())
                      ->orWhere('is_lifetime', true);
                })->latest()->first(),
        ]);
    }

    public function checkIn(Request $request)
    {
        $user = $request->user();
        CheckIn::create([
            'user_id' => $user->id,
            'status' => 'success',
            'checked_in_at' => now(),
        ]);

        return back()->with('success', 'Check-in berhasil! Timer direset.');
    }
}
