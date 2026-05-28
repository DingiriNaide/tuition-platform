<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentProfile extends Model
{

    protected $fillable = [
        'user_id', 'full_name', 'date_of_birth', 'gender',
        'phone', 'school', 'grade', 'medium',
        'district', 'city', 'is_low_income',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}