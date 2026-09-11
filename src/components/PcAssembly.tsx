import { motion, AnimatePresence } from 'motion/react'
import { useTranslation } from 'react-i18next'
import type { BuildSelection, SlotId } from '@/lib/builder-data'

// Stylized PC case with parts appearing as they are selected.

const VOLT = 'hsl(72 89% 58%)'
const DIM = 'hsl(240 5% 25%)'
const PANEL = 'hsl(240 6% 9%)'
const PART_BG = 'hsl(240 5% 14%)'

function Part({
  show,
  children,
  delay = 0,
}: {
  show: boolean
  children: React.ReactNode
  delay?: number
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.g
          initial={{ opacity: 0, scale: 0.7, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 8 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22, delay }}
        >
          {children}
        </motion.g>
      )}
    </AnimatePresence>
  )
}

function SlotGhost({ x, y, w, h, label }: { x: number; y: number; w: number; h: number; label: string }) {
  return (
    <g opacity={0.45}>
      <rect x={x} y={y} width={w} height={h} rx={4} fill="none" stroke={DIM} strokeWidth={1} strokeDasharray="4 4" />
      <text x={x + w / 2} y={y + h / 2 + 3} textAnchor="middle" fontSize={7} fill={DIM} fontFamily="monospace">
        {label}
      </text>
    </g>
  )
}

function Label({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <text x={x} y={y} textAnchor="middle" fontSize={7.5} fill={VOLT} fontFamily="monospace" fontWeight="bold">
      {text}
    </text>
  )
}

export default function PcAssembly({ selection }: { selection: BuildSelection }) {
  const { t } = useTranslation()
  const sel = (slot: SlotId) => !!selection[slot]

  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-card">
      <div className="bg-grid absolute inset-0 opacity-40" />
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-volt/10 blur-[60px]" />
      <div className="relative p-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t('builder.assembly')}
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-volt">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-volt opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-volt" />
            </span>
            {t('builder.livePreview')}
          </span>
        </div>
        <svg viewBox="0 0 320 400" className="w-full" role="img" aria-label="PC assembly">
          {/* Case body */}
          <rect x={40} y={20} width={240} height={360} rx={10} fill={PANEL} stroke={sel('case') ? VOLT : DIM} strokeWidth={sel('case') ? 2 : 1.2} />
          {/* Glass panel reflection */}
          <path d="M60 40 L130 40 L80 380 L60 380 Z" fill="white" opacity={0.03} />
          {/* Front intake fans */}
          {[70, 160, 250].map((cy) => (
            <g key={cy}>
              <circle cx={58} cy={cy} r={16} fill="none" stroke={sel('case') ? VOLT : DIM} strokeWidth={1.2} opacity={sel('case') ? 0.9 : 0.5} />
              {sel('case') && (
                <motion.g
                  style={{ originX: '58px', originY: `${cy}px` }}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
                >
                  {[0, 60, 120, 180, 240, 300].map((a) => (
                    <line key={a} x1={58} y1={cy} x2={58 + 12} y2={cy} stroke={VOLT} strokeWidth={1.6} opacity={0.7} transform={`rotate(${a} 58 ${cy})`} />
                  ))}
                </motion.g>
              )}
            </g>
          ))}

          {/* Motherboard */}
          {!sel('motherboard') && <SlotGhost x={100} y={60} w={150} h={230} label={t('builder.slotMotherboard')} />}
          <Part show={sel('motherboard')}>
            <rect x={100} y={60} width={150} height={230} rx={4} fill={PART_BG} stroke={VOLT} strokeWidth={1.5} />
            <circle cx={110} cy={70} r={2} fill={VOLT} />
            <circle cx={240} cy={70} r={2} fill={VOLT} />
            <circle cx={110} cy={280} r={2} fill={VOLT} />
            <circle cx={240} cy={280} r={2} fill={VOLT} />
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1={104} y1={110 + i * 34} x2={104} y2={126 + i * 34} stroke={DIM} strokeWidth={2} />
            ))}
          </Part>

          {/* CPU socket + chip */}
          {!sel('cpu') && sel('motherboard') && <SlotGhost x={118} y={84} w={52} h={52} label="CPU" />}
          <Part show={sel('cpu') && sel('motherboard')}>
            <rect x={118} y={84} width={52} height={52} rx={3} fill="hsl(240 5% 20%)" stroke={VOLT} strokeWidth={1.5} />
            <rect x={130} y={96} width={28} height={28} rx={2} fill={VOLT} opacity={0.85} />
            <Label x={144} y={113} text="CPU" />
          </Part>

          {/* Cooler fan over CPU */}
          <Part show={sel('cooler') && sel('motherboard') && sel('cpu')} delay={0.05}>
            <circle cx={144} cy={110} r={30} fill="hsl(240 5% 16% / 0.92)" stroke={VOLT} strokeWidth={1.5} />
            <motion.g
              style={{ originX: '144px', originY: '110px' }}
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'linear' }}
            >
              {[0, 72, 144, 216, 288].map((a) => (
                <path key={a} d="M144 110 q10 -6 20 -2" fill="none" stroke={VOLT} strokeWidth={2.4} transform={`rotate(${a} 144 110)`} />
              ))}
            </motion.g>
            <circle cx={144} cy={110} r={5} fill={VOLT} />
          </Part>

          {/* RAM sticks */}
          {!sel('ram') && sel('motherboard') && <SlotGhost x={184} y={84} w={56} h={14} label="RAM" />}
          <Part show={sel('ram') && sel('motherboard')}>
            {[0, 1, 2, 3].map((i) => (
              <motion.rect
                key={i}
                x={184 + i * 14}
                y={80}
                width={10}
                height={60}
                rx={2}
                fill={i % 2 === 0 ? 'hsl(240 5% 20%)' : 'hsl(240 5% 17%)'}
                stroke={VOLT}
                strokeWidth={1.2}
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.12, type: 'spring', stiffness: 300, damping: 20 }}
              />
            ))}
            <Label x={212} y={152} text="RAM" />
          </Part>

          {/* GPU */}
          {!sel('gpu') && sel('motherboard') && <SlotGhost x={108} y={196} w={132} h={34} label="GPU" />}
          <Part show={sel('gpu') && sel('motherboard')} delay={0.1}>
            <rect x={108} y={196} width={132} height={34} rx={3} fill="hsl(240 5% 18%)" stroke={VOLT} strokeWidth={1.5} />
            <rect x={108} y={204} width={10} height={18} fill={VOLT} opacity={0.8} />
            <circle cx={205} cy={213} r={11} fill="none" stroke={VOLT} strokeWidth={1.4} />
            <motion.g
              style={{ originX: '205px', originY: '213px' }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            >
              {[0, 90, 180, 270].map((a) => (
                <line key={a} x1={205} y1={213} x2={205 + 8} y2={213} stroke={VOLT} strokeWidth={1.6} transform={`rotate(${a} 205 213)`} />
              ))}
            </motion.g>
            <Label x={152} y={217} text="GPU" />
          </Part>

          {/* M.2 storage */}
          {!sel('storage') && sel('motherboard') && <SlotGhost x={108} y={246} w={60} h={12} label="M.2" />}
          <Part show={sel('storage') && sel('motherboard')} delay={0.15}>
            <rect x={108} y={246} width={60} height={12} rx={2} fill="hsl(240 5% 20%)" stroke={VOLT} strokeWidth={1.2} />
            {[0, 1, 2].map((i) => (
              <rect key={i} x={114 + i * 16} y={249} width={10} height={6} rx={1} fill={VOLT} opacity={0.7} />
            ))}
          </Part>

          {/* PSU shroud + PSU */}
          {!sel('psu') && <SlotGhost x={100} y={306} w={150} h={56} label="PSU" />}
          <Part show={sel('psu')} delay={0.1}>
            <rect x={96} y={300} width={158} height={6} fill={DIM} opacity={0.5} />
            <rect x={100} y={310} width={150} height={52} rx={4} fill="hsl(240 5% 16%)" stroke={VOLT} strokeWidth={1.5} />
            <circle cx={132} cy={336} r={16} fill="none" stroke={VOLT} strokeWidth={1.4} />
            <motion.g
              style={{ originX: '132px', originY: '336px' }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2.8, ease: 'linear' }}
            >
              {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
                <line key={a} x1={132} y1={336} x2={132 + 12} y2={336} stroke={VOLT} strokeWidth={1.4} transform={`rotate(${a} 132 336)`} />
              ))}
            </motion.g>
            <Label x={198} y={340} text="PSU" />
          </Part>

          {/* Volt accent strip on case */}
          <Part show={sel('case')}>
            <motion.rect
              x={262}
              y={30}
              width={4}
              height={340}
              rx={2}
              fill={VOLT}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
            />
          </Part>
        </svg>

        {/* Selected part readout */}
        <div className="mt-2 grid grid-cols-2 gap-1 text-[11px]">
          {SLOTS_READOUT.map((slot) => (
            <div key={slot} className="flex items-center gap-1.5 truncate">
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${sel(slot) ? 'bg-volt' : 'bg-muted'}`} />
              <span className={`truncate ${sel(slot) ? 'text-foreground' : 'text-muted-foreground'}`}>
                {selection[slot]?.name ?? t(`builder.slot.${slot}`)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const SLOTS_READOUT: SlotId[] = ['case', 'motherboard', 'cpu', 'cooler', 'ram', 'gpu', 'storage', 'psu']
