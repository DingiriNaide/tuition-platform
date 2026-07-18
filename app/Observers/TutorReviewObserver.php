<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\TutorReview;

class TutorReviewObserver
{
    public function saved(TutorReview $review): void
    {
        $this->recalculate($review);
    }

    public function deleted(TutorReview $review): void
    {
        $this->recalculate($review);
    }

    private function recalculate(TutorReview $review): void
    {
        $tutorProfile = $review->tutorProfile;

        // Volume-weighted: every individual review across every course counts equally,
        // so a tutor with many reviews on a popular course isn't dragged down by
        // a single low review on a rarely-booked one.
        $tutorProfile->update([
            'rating'        => $tutorProfile->reviews()->avg('rating') ?? 0,
            'total_reviews' => $tutorProfile->reviews()->count(),
        ]);
    }
}