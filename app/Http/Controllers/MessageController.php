<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use App\Models\Message;
use App\Models\MessageRecipient;

class MessageController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'messageText' => 'nullable|string|max:10000',
            'recipientName' => 'required|string|max:255',
            'recipientRelationship' => 'nullable|string|max:50',
            'recipientPhone' => 'required|string|max:20',
            'recipientEmail' => 'nullable|email',
            'triggerDays' => 'required|integer|in:30,60,90',
            'securityQuestion' => 'nullable|string|max:255',
            'securityAnswer' => 'nullable|string|max:255',
            'audioFile' => 'nullable|file|mimes:webm,mp3,wav|max:10240',
            'videoFile' => 'nullable|file|mimes:webm,mp4,mov|max:51200',
            'documentFile' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,txt,zip,jpg,jpeg,png|max:51200',
        ]);

        if (empty($validated['messageText']) && !$request->hasFile('audioFile') && !$request->hasFile('videoFile') && !$request->hasFile('documentFile')) {
            return back()->withErrors(['messageText' => 'Minimal satu konten harus diisi (teks, audio, video, atau dokumen).']);
        }

        $audioPath = $request->hasFile('audioFile') ? $request->file('audioFile')->store('messages/audio', 'public') : null;
        $videoPath = $request->hasFile('videoFile') ? $request->file('videoFile')->store('messages/video', 'public') : null;
        $documentPath = $request->hasFile('documentFile') ? $request->file('documentFile')->store('messages/documents', 'public') : null;

        $message = Message::create([
            'user_id' => $request->user()->id,
            'content_text' => $validated['messageText'] ?? null,
            'content_audio_path' => $audioPath,
            'content_video_path' => $videoPath,
            'content_file_path' => $documentPath,
            'trigger_days' => $validated['triggerDays'],
            'security_question' => $validated['securityQuestion'] ?? null,
            'security_answer' => $validated['securityAnswer'] ?? null,
            'status' => 'active',
        ]);

        MessageRecipient::create([
            'message_id' => $message->id,
            'name' => $validated['recipientName'],
            'relationship' => $validated['recipientRelationship'] ?? null,
            'wa_number' => $validated['recipientPhone'],
            'email' => $validated['recipientEmail'] ?? null,
        ]);

        return back()->with('success', 'Pesan berhasil disimpan & diamankan!');
    }

    public function update(Request $request, Message $message)
    {
        if ($message->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'messageText' => 'nullable|string|max:10000',
            'recipientName' => 'required|string|max:255',
            'recipientRelationship' => 'nullable|string|max:50',
            'recipientPhone' => 'required|string|max:20',
            'recipientEmail' => 'nullable|email',
            'triggerDays' => 'required|integer|in:30,60,90',
            'securityQuestion' => 'nullable|string|max:255',
            'securityAnswer' => 'nullable|string|max:255',
            'audioFile' => 'nullable|file|mimes:webm,mp3,wav|max:10240',
            'videoFile' => 'nullable|file|mimes:webm,mp4,mov|max:51200',
            'documentFile' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,txt,zip,jpg,jpeg,png|max:51200',
        ]);

        $updateData = [
            'content_text' => $validated['messageText'] ?? null,
            'trigger_days' => $validated['triggerDays'],
            'security_question' => $validated['securityQuestion'] ?? null,
            'security_answer' => $validated['securityAnswer'] ?? null,
        ];

        if ($request->hasFile('audioFile')) {
            if ($message->content_audio_path) Storage::disk('public')->delete($message->content_audio_path);
            $updateData['content_audio_path'] = $request->file('audioFile')->store('messages/audio', 'public');
        } elseif ($request->input('removeAudio') === '1') {
            if ($message->content_audio_path) Storage::disk('public')->delete($message->content_audio_path);
            $updateData['content_audio_path'] = null;
        }

        if ($request->hasFile('videoFile')) {
            if ($message->content_video_path) Storage::disk('public')->delete($message->content_video_path);
            $updateData['content_video_path'] = $request->file('videoFile')->store('messages/video', 'public');
        } elseif ($request->input('removeVideo') === '1') {
            if ($message->content_video_path) Storage::disk('public')->delete($message->content_video_path);
            $updateData['content_video_path'] = null;
        }

        if ($request->hasFile('documentFile')) {
            if ($message->content_file_path) Storage::disk('public')->delete($message->content_file_path);
            $updateData['content_file_path'] = $request->file('documentFile')->store('messages/documents', 'public');
        } elseif ($request->input('removeDocument') === '1') {
            if ($message->content_file_path) Storage::disk('public')->delete($message->content_file_path);
            $updateData['content_file_path'] = null;
        }

        $message->update($updateData);

        $recipient = $message->recipients()->first();
        if ($recipient) {
            $recipient->update([
                'name' => $validated['recipientName'],
                'relationship' => $validated['recipientRelationship'] ?? null,
                'wa_number' => $validated['recipientPhone'],
                'email' => $validated['recipientEmail'] ?? null,
            ]);
        }

        return back()->with('success', 'Pesan berhasil diupdate!');
    }

    public function destroy(Request $request, Message $message)
    {
        if ($message->user_id !== $request->user()->id) {
            abort(403);
        }

        if ($message->content_audio_path) Storage::disk('public')->delete($message->content_audio_path);
        if ($message->content_video_path) Storage::disk('public')->delete($message->content_video_path);
        if ($message->content_file_path) Storage::disk('public')->delete($message->content_file_path);

        $message->delete();

        return back()->with('success', 'Pesan berhasil dihapus.');
    }

    public function preview(Request $request, Message $message)
    {
        if ($message->user_id !== $request->user()->id) {
            abort(403);
        }

        $message->load('recipients');
        $recipient = $message->recipients->first();

        return Inertia::render('RecipientView', [
            'msg' => [
                'id' => (string) $message->id,
                'recipient' => $recipient?->name ?? 'Unknown',
                'relationship' => $recipient?->relationship ?? '',
                'phone' => $recipient?->wa_number ?? '',
                'types' => array_values(array_filter([
                    $message->content_text ? 'Teks' : null,
                    $message->content_audio_path ? 'Audio' : null,
                    $message->content_video_path ? 'Video' : null,
                    $message->content_file_path ? 'Dokumen' : null,
                ])),
                'triggerDays' => $message->trigger_days,
                'createdAt' => $message->created_at->format('d M Y'),
                'status' => $message->status,
                'audioDuration' => $message->content_audio_path ? 'Tersedia' : null,
                'content_text' => $message->content_text,
                'content_video_path' => $message->content_video_path,
                'content_file_path' => $message->content_file_path,
                'content_audio_path' => $message->content_audio_path,
                'has_security' => !empty($message->security_question) && !empty($message->security_answer) || !empty($message->pin_hash),
                'security_question' => $message->security_question,
            ],
            'isOwnerPreview' => true,
        ]);
    }

    public function verifyPin(Request $request, Message $message)
    {
        $request->validate(['answer' => 'required|string']);

        $isValid = false;
        
        if ($message->security_answer) {
            $expected = strtolower(trim($message->security_answer));
            $actual = strtolower(trim($request->answer));
            if ($expected === $actual) {
                $isValid = true;
            }
        } elseif ($message->pin_hash) {
            if (Hash::check($request->answer, $message->pin_hash)) {
                $isValid = true;
            }
        } else {
            $isValid = true;
        }

        if ($isValid) {
            return response()->json(['valid' => true]);
        }

        return response()->json(['valid' => false, 'message' => 'Jawaban kurang tepat. Coba lagi.'], 422);
    }

    public function recipientView(Request $request, Message $message)
    {
        $message->load('recipients');
        $recipient = $message->recipients->first();

        return Inertia::render('RecipientView', [
            'msg' => [
                'id' => (string) $message->id,
                'recipient' => $recipient?->name ?? 'Unknown',
                'relationship' => $recipient?->relationship ?? '',
                'phone' => $recipient?->wa_number ?? '',
                'types' => array_values(array_filter([
                    $message->content_text ? 'Teks' : null,
                    $message->content_audio_path ? 'Audio' : null,
                    $message->content_video_path ? 'Video' : null,
                    $message->content_file_path ? 'Dokumen' : null,
                ])),
                'triggerDays' => $message->trigger_days,
                'createdAt' => $message->created_at->format('d M Y'),
                'status' => $message->status,
                'content_text' => $message->content_text,
                'content_video_path' => $message->content_video_path,
                'content_file_path' => $message->content_file_path,
                'content_audio_path' => $message->content_audio_path,
                'has_security' => !empty($message->security_question) && !empty($message->security_answer) || !empty($message->pin_hash),
                'security_question' => $message->security_question,
            ],
            'isOwnerPreview' => false,
        ]);
    }
}

