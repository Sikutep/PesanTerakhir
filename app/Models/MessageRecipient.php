<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MessageRecipient extends Model
{
    protected $fillable = [
        'message_id',
        'name',
        'relationship',
        'wa_number',
        'email',
        'status',
        'failed_reason',
    ];

    public function message()
    {
        return $this->belongsTo(Message::class);
    }
}
