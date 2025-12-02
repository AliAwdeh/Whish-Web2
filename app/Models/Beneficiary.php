<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Beneficiary extends Model
{
    protected $fillable = [
        'user_id',
        'recipient_user_id',
        'full_name',
        'country',
        'city',
        'payout_method',
        'payout_details',
    ];

    protected $casts = [
        'payout_details' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function recipientUser()
    {
        return $this->belongsTo(User::class, 'recipient_user_id');
    }

    public function transfers()
    {
        return $this->hasMany(Transfer::class);
    }
}
