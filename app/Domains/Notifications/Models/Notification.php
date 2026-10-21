<?php

namespace App\Domains\Notifications\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'type',
        'actor_type',
        'actor_id',
        'subject_type',
        'subject_id',
        'payload',
    ];

    protected $casts = [
        'payload' => 'array',
    ];

    public function actor()
    {
        return $this->morphTo();
    }

    public function subject()
    {
        return $this->morphTo();
    }

    public function recipients()
    {
        return $this->hasMany(NotificationRecipient::class);
    }
}
