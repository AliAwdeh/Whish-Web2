<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FeeStructure extends Model
{
    protected $fillable = [
        'from_currency_id',
        'to_currency_id',
        'payout_method',
        'base_fee',
        'percent_fee',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function fromCurrency()
    {
        return $this->belongsTo(Currency::class, 'from_currency_id');
    }

    public function toCurrency()
    {
        return $this->belongsTo(Currency::class, 'to_currency_id');
    }
}
