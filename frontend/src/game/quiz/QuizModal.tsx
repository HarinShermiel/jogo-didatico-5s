// QuizModal — gate conceitual entre fases. Aparece quando o radar ≥ 70% e o
// jogador tenta avançar. O gabarito vive só no servidor; o front envia apenas
// o índice da opção escolhida (0=A, 1=B, 2=C).
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import type { QuizConceitual } from '../../types'
import { SENSO_COR, SENSO_NOME } from '../sensoInfo'

interface Props {
  quiz: QuizConceitual
}

export function QuizModal({ quiz }: Props): JSX.Element {
  const dispatch = useGameStore((s) => s.dispatch)
  const [escolhida, setEscolhida] = useState<number | null>(null)
  const [enviando, setEnviando] = useState(false)

  const confirmar = async (): Promise<void> => {
    if (escolhida === null || enviando) return
    setEnviando(true)
    await dispatch('quiz.responder', { opcao: escolhida })
    // O modal some automaticamente quando quizConceitual volta null do servidor.
  }

  const cor = SENSO_COR[quiz.senso]

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="dialog"
      aria-modal="true"
      aria-label="Quiz Conceitual"
    >
      <motion.div
        className="w-full max-w-2xl rounded-3xl bg-marca-azul p-6 text-white shadow-2xl"
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <p className="text-sm font-bold uppercase tracking-wide" style={{ color: cor }}>
          🎓 Quiz — {SENSO_NOME[quiz.senso]}
        </p>
        <p className="mt-1 text-white/80 text-sm">
          Antes de avançar, demonstre que internalizou o senso.
        </p>

        <p className="mt-4 text-base font-semibold leading-snug">{quiz.pergunta}</p>

        <ul className="mt-4 space-y-2">
          {quiz.opcoes.map((op, idx) => (
            <li key={op.label}>
              <button
                onClick={() => setEscolhida(idx)}
                disabled={enviando}
                className={[
                  'w-full rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition',
                  escolhida === idx
                    ? 'border-marca-laranja bg-marca-laranja/20 text-white'
                    : 'border-white/20 hover:border-white/50 hover:bg-white/10 text-white/90',
                  enviando ? 'opacity-60 cursor-not-allowed' : '',
                ].join(' ')}
                aria-pressed={escolhida === idx}
              >
                <span className="font-extrabold mr-2" style={{ color: cor }}>
                  {op.label})
                </span>
                {op.texto}
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex justify-end">
          <button
            onClick={() => void confirmar()}
            disabled={escolhida === null || enviando}
            className="rounded-xl bg-marca-laranja px-6 py-2 font-bold text-marca-azul transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {enviando ? 'Enviando…' : 'Confirmar resposta'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
