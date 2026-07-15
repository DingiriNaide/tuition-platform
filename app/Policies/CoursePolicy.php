<?php

namespace App\Policies;

use App\Models\Course;
use App\Models\User;

class CoursePolicy
{
    /**
     * Tutor can manage courses they own. Admins can manage any course.
     */
    public function update(User $user, Course $course): bool
    {
        if ($user->hasRole(['admin', 'super-admin'])) {
            return true;
        }

        return $user->tutorProfile
            && $course->tutor_profile_id === $user->tutorProfile->id;
    }

    public function view(User $user, Course $course): bool
    {
        // Courses are generally publicly viewable/listable — adjust if you want stricter rules
        return true;
    }

    public function delete(User $user, Course $course): bool
    {
        return $this->update($user, $course);
    }
}