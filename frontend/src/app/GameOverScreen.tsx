// Tela de Game Over — radar insuficiente para avançar de fase.
import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { Button } from '../ui/Button'

interface Props {
  score5s: number
  fase: number
  minimo: number
  onReset: () => void
}

export function GameOverScreen({ score5s, fase, minimo, onReset }: Props): JSX.Element {
  const loading = useGameStore((s) => s.loading)

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-black/90 px-6 text-center backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Ícone de game over */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
        className="text-8xl"
      >
        💀
      </motion.div>

      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="text-4xl font-extrabold text-white"
      >
        Game Over
      </motion.h1>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="max-w-sm space-y-2 rounded-2xl bg-white/10 px-6 py-5 text-white"
      >
        <p className="text-lg font-bold text-marca-laranja">
          Fase {fase} não concluída
        </p>
        <p className="text-sm text-white/80">
          Você precisava de pelo menos{' '}
          <span className="font-black text-white">{minimo}% no Radar</span>{' '}
          desta fase para avançar, mas terminou com{' '}
          <span className="font-black text-red-400">{score5s.toFixed(1)}%</span>.
        </p>
        <p className="mt-2 text-xs text-white/50">
          Aplique os sensos com mais cuidado e tente de novo!
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          onClick={onReset}
          disabled={loading}
          className="px-8 py-3 text-lg shadow-2xl shadow-marca-laranja/40"
        >
          {loading ? 'Reiniciando…' : '🔄 Tentar novamente'}
        </Button>
      </motion.div>
    </motion.div>
  )
}
