<?php

namespace App\Enums\Assignment;

// NONE | UNDER_REVIEW | OBSERVED
enum AssignmentReviewStatus: int
{
    case NONE = 0;
    case UNDER_REVIEW = 1;
    case OBSERVED = 2;
}
