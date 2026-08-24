<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Message;
use App\Models\MessageRecipient;
use App\Models\CheckIn;
use App\Models\Subscription;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // FIX #6: Add email_verified_at so user can access verified routes
        $user = User::updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Budi Hartono',
                'wa_number' => '+6281234567890',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'guardian_contact' => '+6281299998888',
                'ping_schedule' => 'siang',
                'grace_period_enabled' => true,
                'default_trigger_days' => 60,
            ]
        );

        Subscription::updateOrCreate(
            ['user_id' => $user->id],
            [
                'plan_id' => 'lifetime',
                'is_lifetime' => true,
                'active_until' => null,
            ]
        );

        // Check-in 8 days ago
        CheckIn::create([
            'user_id' => $user->id,
            'status' => 'success',
            'checked_in_at' => Carbon::now()->subDays(8),
        ]);

        // First check-in 3 months ago
        CheckIn::create([
            'user_id' => $user->id,
            'status' => 'success',
            'checked_in_at' => Carbon::now()->subMonths(3),
        ]);

        // Another check-in 1 month ago
        CheckIn::create([
            'user_id' => $user->id,
            'status' => 'success',
            'checked_in_at' => Carbon::now()->subMonth(),
        ]);

        // Message 1 (Active, Text + Audio + Document)
        $msg1 = Message::create([
            'user_id' => $user->id,
            'content_text' => "Untuk istriku tercinta Siti,\n\nJika kamu membaca ini, berarti aku sudah tidak bisa lagi menyampaikan ini secara langsung. Aku ingin kamu tahu bahwa setiap detik bersamamu adalah kebahagiaan terbesar dalam hidupku.\n\nPassword brankas rumah: 4891\nNo. rekening tabungan pendidikan anak: BCA 7820394561\n\nJaga anak-anak kita. Aku sayang kalian selamanya.",
            'content_audio_path' => 'messages/audio/mock-audio.webm',
            'content_file_path' => 'messages/documents/mock-doc.pdf',
            'trigger_days' => 60,
            'pin_hash' => Hash::make('1234'),
            'status' => 'active',
            'created_at' => Carbon::now()->subDays(40),
            'updated_at' => Carbon::now()->subDays(40),
        ]);
        MessageRecipient::create([
            'message_id' => $msg1->id,
            'name' => 'Siti Rahayu',
            'relationship' => 'Istri',
            'wa_number' => '+6281211112222',
            'email' => 'siti@example.com',
        ]);

        // Message 2 (Active, Text + Video)
        $msg2 = Message::create([
            'user_id' => $user->id,
            'content_text' => "Ayah, ini Budi.\n\nAda beberapa hal yang perlu Ayah ketahui tentang aset keluarga kita. Semua dokumen tanah ada di brankas kantor, kunci cadangannya ada di laci meja kerja.\n\nSertifikat rumah Jl. Merdeka No. 45 atas nama Ayah.\nSertifikat tanah Bogor atas nama bersama.",
            'content_video_path' => 'messages/video/mock-video.webm',
            'trigger_days' => 90,
            'pin_hash' => Hash::make('5678'),
            'status' => 'active',
            'created_at' => Carbon::now()->subDays(20),
            'updated_at' => Carbon::now()->subDays(20),
        ]);
        MessageRecipient::create([
            'message_id' => $msg2->id,
            'name' => 'Bapak Hendra',
            'relationship' => 'Ayah',
            'wa_number' => '+6281333334444',
        ]);

        // Message 3 (Draft, Audio only)
        $msg3 = Message::create([
            'user_id' => $user->id,
            'content_audio_path' => 'messages/audio/mock-audio-2.webm',
            'trigger_days' => 30,
            'status' => 'draft',
            'created_at' => Carbon::now()->subDays(5),
            'updated_at' => Carbon::now()->subDays(5),
        ]);
        MessageRecipient::create([
            'message_id' => $msg3->id,
            'name' => 'Rizky Pratama',
            'relationship' => 'Sahabat',
            'wa_number' => '+6281555556666',
        ]);
    }
}
