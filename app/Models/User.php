<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'wa_number',
        'guardian_contact',
        'ping_schedule',
        'grace_period_enabled',
        'default_trigger_days',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function checkIns()
    {
        return $this->hasMany(CheckIn::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'grace_period_enabled' => 'boolean',
            'default_trigger_days' => 'integer',
        ];
    }
}
