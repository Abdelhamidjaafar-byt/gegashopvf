import { motion } from 'motion/react'
import { Sparkles } from 'lucide-react'

interface HeroBubbleProps {
  text?: string
  className?: string
}

export default function HeroBubble({ text, className = '' }: HeroBubbleProps) {
  if (!text || !text.trim()) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: [0, -5, 0] }}
      transition={{
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 },
        y: { repeat: Infinity, duration: 4, ease: 'easeInOut' },
      }}
      className={`relative inline-flex items-center gap-2.5 rounded-2xl border border-volt/40 bg-background/85 px-4 py-2.5 text-xs font-semibold tracking-wide text-foreground shadow-lg shadow-volt/10 backdrop-blur-md dark:bg-card/90 md:text-sm ${className}`}
    >
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-volt text-volt-fg">
        <Sparkles className="h-3.5 w-3.5" />
      </div>
      <span className="leading-snug">{text}</span>

      {/* Speech bubble tail pointer */}
      <div className="absolute -bottom-2 left-6 h-0 w-0 border-x-[6px] border-x-transparent border-t-[8px] border-t-volt/40" />
      <div className="absolute -bottom-[6px] left-6 h-0 w-0 border-x-[5px] border-x-transparent border-t-[7px] border-t-background dark:border-t-card" />
    </motion.div>
  )
}
