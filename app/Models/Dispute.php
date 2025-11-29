<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dispute extends Model
{
    protected $fillable = [
        'transfer_id',
        'user_id',
        'type',
        'status',
        'reason',
        'resolution_notes',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transfer()
    {
        return $this->belongsTo(Transfer::class);
    }
}
