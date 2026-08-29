"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StarRating({
  value,
  onChange,
  readOnly = false,
  size = 18,
}: {
  value: number;
  onChange?: (valor: number) => void;
  readOnly?: boolean;
  size?: number;
}) {
  return (
    <div className="flex gap-0.5" role={readOnly ? "img" : undefined} aria-label={readOnly ? `${value} de 5 estrellas` : undefined}>
      {[1, 2, 3, 4, 5].map((n) =>
        readOnly ? (
          <Star
            key={n}
            size={size}
            className={n <= value ? "fill-brand text-brand" : "fill-none text-muted-foreground/40"}
          />
        ) : (
          <button
            key={n}
            type="button"
            onClick={() => onChange?.(n)}
            aria-label={`${n} estrella${n > 1 ? "s" : ""}`}
            className={cn("transition-transform hover:scale-110")}
          >
            <Star
              size={size}
              className={n <= value ? "fill-brand text-brand" : "fill-none text-muted-foreground/40"}
            />
          </button>
        ),
      )}
    </div>
  );
}
