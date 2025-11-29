<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'country',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    // JWT
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }
    public function getJWTCustomClaims()
    {
        return [];
    }

    // Relations
    public function agent()
    {
        return $this->hasOne(Agent::class);
    }

    public function paymentMethods()
    {
        return $this->hasMany(PaymentMethod::class);
    }

    public function beneficiaries()
    {
        return $this->hasMany(Beneficiary::class);
    }

    public function transfers()
    {
        return $this->hasMany(Transfer::class); // as sender
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function disputes()
    {
        return $this->hasMany(Dispute::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }
}
