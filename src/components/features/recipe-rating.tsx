"use client";

import { useState } from "react";

interface Props {
  recipeId: string;
  initialRating: number | null;
}

export function RecipeRating({ recipeId, initialRating }: Props) {
  const [rating, setRating] = useState<number | null>(initialRating);
  const [hovered, setHovered] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const handleRate = async (value: number) => {
    const newRating = rating === value ? null : value;
    setSaving(true);
    const res = await fetch(`/api/recipes/${recipeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: newRating }),
    });
    if (res.ok) setRating(newRating);
    setSaving(false);
  };

  return (
    <div className="flex items-center gap-1">
      <span className="text-sm text-muted-foreground mr-2">評価:</span>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          disabled={saving}
          onClick={() => handleRate(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(null)}
          className="text-2xl leading-none disabled:opacity-50 transition-colors"
        >
          <span className={(hovered ?? rating ?? 0) >= star ? "text-amber-400" : "text-muted-foreground/30"}>
            ★
          </span>
        </button>
      ))}
      {rating && (
        <span className="text-sm text-muted-foreground ml-1">{rating}/5</span>
      )}
    </div>
  );
}
