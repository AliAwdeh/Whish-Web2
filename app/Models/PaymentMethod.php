<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'provider_name',
        'masked_number',
        'currency',
        'is_verified',
        'details',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'details'     => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
