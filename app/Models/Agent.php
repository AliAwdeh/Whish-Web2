<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Agent extends Model
{
    protected $fillable = [
        'user_id',
        'store_name',
        'address',
        'city',
        'country',
        'latitude',
        'longitude',
        'working_hours',
        'status',
    ];

    protected $casts = [
        'working_hours' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transfers()
    {
        return $this->hasMany(Transfer::class);
    }

    public function commissions()
    {
        return $this->hasMany(AgentCommission::class);
    }
}
