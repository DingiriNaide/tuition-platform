<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\Subject;

class SubjectsSeeder extends Seeder
{
    public function run(): void
    {
        $subjects = [
            // O/L subjects
            ['name' => 'Mathematics', 'name_sinhala' => 'ගණිතය', 'name_tamil' => 'கணிதம்', 'syllabus' => 'ol'],
            ['name' => 'Science', 'name_sinhala' => 'විද්‍යාව', 'name_tamil' => 'அறிவியல்', 'syllabus' => 'ol'],
            ['name' => 'English', 'name_sinhala' => 'ඉංග්‍රීසි', 'name_tamil' => 'ஆங்கிலம்', 'syllabus' => 'ol'],
            ['name' => 'Sinhala', 'name_sinhala' => 'සිංහල', 'name_tamil' => 'சிங்களம்', 'syllabus' => 'ol'],
            ['name' => 'Tamil', 'name_sinhala' => 'දෙමළ', 'name_tamil' => 'தமிழ்', 'syllabus' => 'ol'],
            ['name' => 'History', 'name_sinhala' => 'ඉතිහාසය', 'name_tamil' => 'வரலாறு', 'syllabus' => 'ol'],
            ['name' => 'Geography', 'name_sinhala' => 'භූගෝල විද්‍යාව', 'name_tamil' => 'புவியியல்', 'syllabus' => 'ol'],
            ['name' => 'ICT', 'name_sinhala' => 'තොරතුරු තාක්ෂණය', 'name_tamil' => 'ICT', 'syllabus' => 'ol'],
            ['name' => 'Commerce', 'name_sinhala' => 'වාණිජ විද්‍යාව', 'name_tamil' => 'வணிகவியல்', 'syllabus' => 'ol'],
            ['name' => 'Buddhism', 'name_sinhala' => 'බෞද්ධ ධර්මය', 'name_tamil' => 'பௌத்தம்', 'syllabus' => 'ol'],

            // A/L subjects
            ['name' => 'Combined Mathematics', 'name_sinhala' => 'එකාබද්ධ ගණිතය', 'name_tamil' => 'இணைந்த கணிதம்', 'syllabus' => 'al'],
            ['name' => 'Physics', 'name_sinhala' => 'භෞතික විද්‍යාව', 'name_tamil' => 'இயற்பியல்', 'syllabus' => 'al'],
            ['name' => 'Chemistry', 'name_sinhala' => 'රසායන විද්‍යාව', 'name_tamil' => 'வேதியியல்', 'syllabus' => 'al'],
            ['name' => 'Biology', 'name_sinhala' => 'ජීව විද්‍යාව', 'name_tamil' => 'உயிரியல்', 'syllabus' => 'al'],
            ['name' => 'Economics', 'name_sinhala' => 'ආර්ථික විද්‍යාව', 'name_tamil' => 'பொருளியல்', 'syllabus' => 'al'],
            ['name' => 'Accounting', 'name_sinhala' => 'ගිණුම්කරණය', 'name_tamil' => 'கணக்கியல்', 'syllabus' => 'al'],
            ['name' => 'Business Studies', 'name_sinhala' => 'ව්‍යාපාර අධ්‍යයනය', 'name_tamil' => 'வணிக ஆய்வுகள்', 'syllabus' => 'al'],
            ['name' => 'Engineering Technology', 'name_sinhala' => 'ඉංජිනේරු තාක්ෂණය', 'name_tamil' => 'பொறியியல் தொழில்நுட்பம்', 'syllabus' => 'al'],

            // Foundation
            ['name' => 'Foundation Mathematics', 'name_sinhala' => 'පදනම් ගණිතය', 'name_tamil' => 'அடிப்படை கணிதம்', 'syllabus' => 'foundation'],
            ['name' => 'Foundation English', 'name_sinhala' => 'පදනම් ඉංග්‍රීසි', 'name_tamil' => 'அடிப்படை ஆங்கிலம்', 'syllabus' => 'foundation'],
        ];

        foreach ($subjects as $subject) {
            Subject::create([
                'name'          => $subject['name'],
                'name_sinhala'  => $subject['name_sinhala'],
                'name_tamil'    => $subject['name_tamil'],
                'slug'          => Str::slug($subject['name']),
                'syllabus'      => $subject['syllabus'],
                'is_active'     => true,
            ]);
        }
    }
}