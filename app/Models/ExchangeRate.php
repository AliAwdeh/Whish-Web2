<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExchangeRate extends Model
{
    protected static bool $syncingInverse = false;

    protected $fillable = [
        'from_currency_id',
        'to_currency_id',
        'rate',
        'valid_from',
        'valid_to',
    ];

    protected $casts = [
        'valid_from' => 'datetime',
        'valid_to'   => 'datetime',
    ];

    protected static function booted(): void
    {
        static::saved(function (ExchangeRate $rate) {
            $rate->syncInverseRate();
        });
    }

    public function fromCurrency()
    {
        return $this->belongsTo(Currency::class, 'from_currency_id');
    }

    public function toCurrency()
    {
        return $this->belongsTo(Currency::class, 'to_currency_id');
    }

    public function syncInverseRate(): void
    {
        if (self::$syncingInverse) {
            return;
        }

        if ($this->from_currency_id === $this->to_currency_id || $this->rate <= 0) {
            return;
        }

        self::$syncingInverse = true;

        try {
            ExchangeRate::updateOrCreate(
                [
                    'from_currency_id' => $this->to_currency_id,
                    'to_currency_id' => $this->from_currency_id,
                ],
                [
                    'rate' => 1 / $this->rate,
                    'valid_from' => $this->valid_from,
                    'valid_to' => $this->valid_to,
                ]
            );
        } finally {
            self::$syncingInverse = false;
        }
    }
}
