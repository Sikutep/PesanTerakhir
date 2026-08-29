<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'user_id',
        'content_text',
        'content_audio_path',
        'content_video_path',
        'content_file_path',
        'trigger_days',
        'pin_hash',
        'security_question',
        'security_answer',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function recipients()
    {
        return $this->hasMany(MessageRecipient::class);
    }
}
