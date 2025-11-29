<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransferStatusLog extends Model
{
    public $timestamps = false; // we used created_at only

    protected $fillable = [
        'transfer_id',
        'status',
        'message',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function transfer()
    {
        return $this->belongsTo(Transfer::class);
    }
}
