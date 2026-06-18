// Fundo temático por senso — gradiente + padrão de ruído sutil.
// Usado em todos os minigames exceto Seiri (que tem bancada própria).
import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { SENSO_COR, SENSO_SIMBOLO } from './sensoInfo'
import type { SensoKey } from '../types'

interface Props {
  senso: SensoKey
  children: ReactNode
}

const SENSO_GRADIENT: Record<SensoKey, [string, string]> = {
  SEIRI:    ['#1a0a05', '#3a1a08'],
  SEITON:   ['#03182a', '#062d4f'],
  SEISO:    ['#051a0d', '#0a3319'],
  SEIKETSU: ['#130820', '#261040'],
  SHITSUKE: ['#1a1200', '#312200'],
}

export function PhaseBackground({ senso, children }: Props): JSX.Element {
  const cor = SENSO_COR[senso]
  const [from, to] = SENSO_GRADIENT[senso]
  const simbolo = SENSO_SIMBOLO[senso]

  // 6 partículas flutuando ao fundo
  const particulas = Array.from({ length: 6 }, (_, i) => i)

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{ background: `linear-gradient(160deg, ${from} 0%, ${to} 100%)` }}
    >
      {/* Véu de cor do senso (sutil) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(ellipse 80% 60% at 50% 20%, ${cor}18 0%, transparent 70%)` }}
      />

      {/* Partículas de símbolo flutuando */}
      {particulas.map((i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute select-none font-black opacity-0"
          style={{
            color: cor,
            fontSize: 24 + (i % 3) * 14,
            left: `${10 + i * 15}%`,
            bottom: '-10%',
          }}
          animate={{
            y: [0, -(360 + i * 80)],
            opacity: [0, 0.12, 0.12, 0],
            rotate: [0, i % 2 === 0 ? 20 : -20],
          }}
          transition={{
            duration: 8 + i * 2.4,
            delay: i * 1.6,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {simbolo}
        </motion.span>
      ))}

      {/* Barra inferior temática */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-1"
        style={{ background: `linear-gradient(to right, transparent, ${cor}80, transparent)` }}
      />

      {/* Conteúdo */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
