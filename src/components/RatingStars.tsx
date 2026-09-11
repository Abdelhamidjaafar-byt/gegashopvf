import { Star } from 'lucide-react'

export default function RatingStars({
  value,
  onChange,
  size = 4,
}: {
  value: number
  onChange?: (v: number) => void
  size?: number
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(i)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
          aria-label={`${i} star${i > 1 ? 's' : ''}`}
        >
          <Star
            className={i <= Math.round(value) ? 'fill-volt text-volt' : 'text-muted-foreground/40'}
            style={{ width: size * 4, height: size * 4 }}
          />
        </button>
      ))}
    </div>
  )
}
