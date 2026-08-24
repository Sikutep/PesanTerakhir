<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('content_text')->nullable();
            $table->string('content_audio_path')->nullable();
            $table->string('content_file_path')->nullable();
            $table->integer('trigger_days')->default(60);
            $table->string('pin_hash')->nullable();
            $table->enum('status', ['draft', 'active', 'dispatched'])->default('draft');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
