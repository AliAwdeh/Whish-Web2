<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AgentCommission extends Model
{
    protected $fillable = [
        'agent_id',
        'transfer_id',
        'amount',
    ];

    public function agent()
    {
        return $this->belongsTo(Agent::class);
    }

    public function transfer()
    {
        return $this->belongsTo(Transfer::class);
    }
}
