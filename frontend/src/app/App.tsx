import { AnimatePresence, motion } from 'framer-motion'
import { useGameStream } from '../api/useGameStream'
import { useGameStore } from '../store/gameStore'
import { GameScreen } from './GameScreen'
import { HallScreen } from './HallScreen'
import { StartScreen } from './StartScreen'

// Slide horizontal entre telas: a saindo vai pra esquerda, a entrando vem da direita.
const slide = {
  initial: { x: '100%', opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '-100%', opacity: 0 },
}

export function App(): JSX.Element {
  const state = useGameStore((s) => s.state)
  const token = useGameStore((s) => s.token)
  useGameStream(token)

  const tela = state === null ? 'start' : state.finished ? 'hall' : 'game'

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={tela}
          className="absolute inset-0"
          variants={slide}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ type: 'tween', ease: [0.4, 0, 0.2, 1], duration: 0.55 }}
        >
          {state === null ? (
            <StartScreen />
          ) : state.finished ? (
            <HallScreen state={state} />
          ) : (
            <GameScreen state={state} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
