<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transfer extends Model
{
    protected $fillable = [
        'user_id',
        'beneficiary_id',
        'payment_method_id',
        'agent_id',
        'from_currency_id',
        'to_currency_id',
        'amount_from',
        'amount_to',
        'fee_amount',
        'exchange_rate_used',
        'speed',
        'payout_method',
        'status',
        'reference_code',
        'expected_completion_at',
        'offer_id',
        'metadata',
    ];

    protected $casts = [
        'metadata'               => 'array',
        'expected_completion_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function beneficiary()
    {
        return $this->belongsTo(Beneficiary::class);
    }

    public function paymentMethod()
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    public function agent()
    {
        return $this->belongsTo(Agent::class);
    }

    public function fromCurrency()
    {
        return $this->belongsTo(Currency::class, 'from_currency_id');
    }

    public function toCurrency()
    {
        return $this->belongsTo(Currency::class, 'to_currency_id');
    }

    public function offer()
    {
        return $this->belongsTo(Offer::class);
    }

    public function statusLogs()
    {
        return $this->hasMany(TransferStatusLog::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function disputes()
    {
        return $this->hasMany(Dispute::class);
    }
}
