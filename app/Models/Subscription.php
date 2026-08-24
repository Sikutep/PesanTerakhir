<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $fillable = [
        'user_id',
        'plan_id',
        'active_until',
        'is_lifetime',
    ];

    protected $casts = [
        'active_until' => 'datetime',
        'is_lifetime' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
