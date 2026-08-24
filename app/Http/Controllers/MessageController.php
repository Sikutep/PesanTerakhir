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
            'pin' => 'nullable|string|min:4|max:6',
            'audioFile' => 'nullable|file|mimes:webm,mp3,wav|max:10240',
            'videoFile' => 'nullable|file|mimes:webm,mp4,mov|max:51200',
            // FIX #10: Restrict mime types for document upload
            'documentFile' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,txt,zip,jpg,jpeg,png|max:51200',
        ]);

        // FIX: Validate at least one content type is provided
        if (empty($validated['messageText']) && !$request->hasFile('audioFile') && !$request->hasFile('videoFile') && !$request->hasFile('documentFile')) {
            return back()->withErrors(['messageText' => 'Minimal satu konten harus diisi (teks, audio, video, atau dokumen).']);
        }

        // FIX #7: Store on private disk instead of public
        $audioPath = $request->hasFile('audioFile') ? $request->file('audioFile')->store('messages/audio', 'local') : null;
        $videoPath = $request->hasFile('videoFile') ? $request->file('videoFile')->store('messages/video', 'local') : null;
        $documentPath = $request->hasFile('documentFile') ? $request->file('documentFile')->store('messages/documents', 'local') : null;

        $message = Message::create([
            'user_id' => $request->user()->id,
            'content_text' => $validated['messageText'] ?? null,
            'content_audio_path' => $audioPath,
            'content_video_path' => $videoPath,
            'content_file_path' => $documentPath,
            'trigger_days' => $validated['triggerDays'],
            'pin_hash' => !empty($validated['pin']) ? Hash::make($validated['pin']) : null,
            'status' => 'active',
        ]);

        MessageRecipient::create([
            'message_id' => $message->id,
            'name' => $validated['recipientName'],
            'relationship' => $validated['recipientRelationship'] ?? null,
            'wa_number' => $validated['recipientPhone'],
            'email' => $validated['recipientEmail'] ?? null,
        ]);

        return back()->with('success', 'Pesan berhasil disimpan & dienkripsi!');
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
            'pin' => 'nullable|string|min:4|max:6',
            'audioFile' => 'nullable|file|mimes:webm,mp3,wav|max:10240',
            'videoFile' => 'nullable|file|mimes:webm,mp4,mov|max:51200',
            'documentFile' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,txt,zip,jpg,jpeg,png|max:51200',
        ]);

        $updateData = [
            'content_text' => $validated['messageText'] ?? null,
            'trigger_days' => $validated['triggerDays'],
        ];

        if (!empty($validated['pin'])) {
            $updateData['pin_hash'] = Hash::make($validated['pin']);
        }

        if ($request->hasFile('audioFile')) {
            if ($message->content_audio_path) Storage::disk('local')->delete($message->content_audio_path);
            $updateData['content_audio_path'] = $request->file('audioFile')->store('messages/audio', 'local');
        }

        if ($request->hasFile('videoFile')) {
            if ($message->content_video_path) Storage::disk('local')->delete($message->content_video_path);
            $updateData['content_video_path'] = $request->file('videoFile')->store('messages/video', 'local');
        }

        if ($request->hasFile('documentFile')) {
            if ($message->content_file_path) Storage::disk('local')->delete($message->content_file_path);
            $updateData['content_file_path'] = $request->file('documentFile')->store('messages/documents', 'local');
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

        if ($message->content_audio_path) Storage::disk('local')->delete($message->content_audio_path);
        if ($message->content_video_path) Storage::disk('local')->delete($message->content_video_path);
        if ($message->content_file_path) Storage::disk('local')->delete($message->content_file_path);

        $message->delete();

        return back()->with('success', 'Pesan berhasil dihapus.');
    }

    // FIX #8 & #11: Preview with ownership check + PIN verification
    public function preview(Request $request, Message $message)
    {
        // Authorization: only owner can preview
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
                // FIX #3: array_values to ensure JSON array (not object)
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
                'has_pin' => !empty($message->pin_hash),
            ],
            'isOwnerPreview' => true,
        ]);
    }

    // FIX #8: Endpoint for PIN verification
    public function verifyPin(Request $request, Message $message)
    {
        $request->validate(['pin' => 'required|string']);

        if (!$message->pin_hash || Hash::check($request->pin, $message->pin_hash)) {
            return response()->json(['valid' => true]);
        }

        return response()->json(['valid' => false, 'message' => 'PIN salah.'], 422);
    }

    // Public recipient view (no auth required, uses signed URL)
    public function recipientView(Request $request, Message $message)
    {
        // Token validation is now handled by the 'signed' middleware in web.php

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
                'has_pin' => !empty($message->pin_hash),
            ],
            'isOwnerPreview' => false,
        ]);
    }
}
