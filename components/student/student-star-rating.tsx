"use client";

import { Star } from "lucide-react";

interface StudentStarRatingProps {
  rating: number;
  showValue?: boolean;
  size?: number;
}

export function StudentStarRating({
  rating,
  showValue = true,
  size = 12,
}: StudentStarRatingProps) {
  const fullStars = Math.floor(rating);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star
            key={`star-${i}`}
            size={size}
            className={
              i < fullStars
                ? "text-yellow-400 fill-current"
                : "text-gray-300 dark:text-gray-600"
            }
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
