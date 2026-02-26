// src/components/StarRating.tsx
import { Star } from 'lucide-react';

interface StarRatingProps {
    value: number;          // valor actual (0-5)
    onChange?: (v: number) => void; // si se pasa, es interactivo
    size?: number;
}

export default function StarRating({ value, onChange, size = 20 }: StarRatingProps) {
    const isInteractive = !!onChange;

    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    disabled={!isInteractive}
                    onClick={() => onChange?.(star)}
                    className={`transition-transform ${isInteractive ? 'cursor-pointer hover:scale-125' : 'cursor-default'}`}
                    aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
                >
                    <Star
                        size={size}
                        className={star <= Math.round(value)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-600'}
                    />
                </button>
            ))}
        </div>
    );
}
