<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TutorProfile extends Model
{

    protected $fillable = [
        'user_id', 'full_name', 'phone', 'nic_number',
        'city', 'district', 'bio', 'hourly_rate',
        'medium', 'is_verified', 'is_active', 'rating', 'total_reviews',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}