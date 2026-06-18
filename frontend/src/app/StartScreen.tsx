import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { Button } from '../ui/Button'
import { StartBackground } from './StartBackground'

export function StartScreen(): JSX.Element {
  const start = useGameStore((s) => s.start)
  const loading = useGameStore((s) => s.loading)
  const error = useGameStore((s) => s.error)

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center text-white">
      <StartBackground />

      {/* Conteúdo acima do fundo */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Aroldo em destaque: halo pulsante + flutuação suave */}
        <motion.div
          className="relative mb-8"
          initial={{ y: -24, opacity: 0, scale: 0.85 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 16 }}
        >
          {/* Halo de glow atrás */}
          <motion.div
            className="absolute left-1/2 top-1/2 -z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl sm:h-80 sm:w-80"
            style={{ background: 'radial-gradient(circle, rgba(244,122,32,0.55) 0%, transparent 70%)' }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.img
            src="/mentor/mentor-boasvindas.png"
            alt="Mestre 5S dando boas-vindas"
            className="h-56 w-56 object-contain drop-shadow-2xl sm:h-72 sm:w-72"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        <motion.h1
          className="text-5xl font-extrabold tracking-tight sm:text-6xl"
          style={{ textShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          eKaizen <span className="text-marca-laranja">5S</span>
        </motion.h1>

        <motion.p
          className="mt-3 max-w-md text-lg text-white/85"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          A Jornada dos Sensos. Transforme uma estação caótica numa estação 5S exemplar — aprendendo na
          prática, guiado pelo Mestre.
        </motion.p>

        <motion.div
          className="mt-9"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.45, type: 'spring', stiffness: 240, damping: 18 }}
        >
          <Button
            onClick={() => void start()}
            disabled={loading}
            aria-label="Começar a jornada 5S"
            className="px-8 py-3.5 text-lg shadow-2xl shadow-marca-laranja/40"
          >
            {loading ? 'Preparando o chão de fábrica…' : '▶ Começar a jornada'}
          </Button>
        </motion.div>

        {error !== null && <p className="mt-4 text-marca-laranja">{error}</p>}

        <p className="mt-10 text-xs text-white/50">
          Single-player · sem cadastro · aprenda 5S em poucos minutos
        </p>
      </div>
    </main>
  )
}
