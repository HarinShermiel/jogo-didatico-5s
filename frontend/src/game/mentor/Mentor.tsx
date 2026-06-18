// O Mestre 5S (Aroldo): mascote-guia. Troca de pose conforme o estado
// emocional e fala em balão. Flash verde/vermelho indica acerto ou erro.
import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { MENTOR_POSE } from '../sensoInfo'
import type { MentorMood } from '../../types'

// Ajuste de enquadramento individual por pose (translate X, Y, scale, rotate)
// Cada linha é independente — mexa em uma sem afetar as outras.
export const MENTOR_FRAME: Record<MentorMood, string> = {
  boasvindas: 'translate(5%, 4%) scale(1.1) rotate(0deg)',
  comemora:   'translate(10%, -8%) scale(1.3)  rotate(6deg)',
  aprova:     'translate(3%, -5%)  scale(1.05) rotate(0deg)',
  pergunta:   'translate(3%, -5%)  scale(1.05) rotate(0deg)',
}

export function Mentor(): JSX.Element {
  const mentor = useGameStore((s) => s.mentor)

  const ringColor =
    mentor.correto === true
      ? '#3FA34D'
      : mentor.correto === false
        ? '#E4572E'
        : 'rgba(255,255,255,0.3)'

  const badge =
    mentor.correto === true ? '✅' : mentor.correto === false ? '❌' : null

  const corBorda =
    mentor.correto === true ? '#3FA34D' : mentor.correto === false ? '#E4572E' : 'transparent'

  return (
    <div className="flex w-56 flex-col items-center" aria-live="polite">
      {/* Balão de fala — ACIMA do Aroldo, seta apontando pra baixo */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mentor.mensagem}
          className="relative mb-3 w-full rounded-3xl px-4 py-3 text-sm font-medium text-marca-azul shadow-2xl"
          style={{ background: '#fff', border: `2.5px solid ${corBorda}` }}
          initial={{ y: -8, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -8, opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          {mentor.mensagem}
          {/* Seta do balão apontando pra baixo (em direção ao Aroldo) */}
          <span
            className="absolute -bottom-2.5 left-12 h-5 w-5 rotate-45 bg-white"
            style={{
              border: corBorda === 'transparent' ? 'none' : `2.5px solid ${corBorda}`,
              borderLeft: 'none',
              borderTop: 'none',
            }}
            aria-hidden="true"
          />
        </motion.div>
      </AnimatePresence>

      {/* Aroldo — zoom fechado no busto/rosto */}
      <div className="relative shrink-0">
        <motion.div
          key={mentor.mood}
          className="h-44 w-44 overflow-hidden rounded-3xl shadow-2xl sm:h-52 sm:w-52"
          style={{
            background: 'rgba(255,255,255,0.08)',
            boxShadow: `0 0 0 4px ${ringColor}, 0 8px 32px rgba(0,0,0,0.4)`,
          }}
          initial={{ scale: 0.7, rotate: -8, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 18 }}
        >
          <img
            src={MENTOR_POSE[mentor.mood]}
            alt={`Aroldo (${mentor.mood})`}
            className="h-full w-full object-cover"
            style={{
              objectPosition: 'center top',
              transform: MENTOR_FRAME[mentor.mood],
              transformOrigin: 'center top',
            }}
          />
        </motion.div>
        {/* Badge de acerto/erro no canto */}
        <AnimatePresence>
          {badge !== null && (
            <motion.span
              key={badge}
              className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full text-2xl shadow-lg"
              style={{ background: mentor.correto ? '#3FA34D' : '#E4572E' }}
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 16 }}
            >
              {badge}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
