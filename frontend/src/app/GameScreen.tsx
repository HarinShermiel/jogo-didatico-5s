import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { PhaseIntroOverlay } from '../game/PhaseIntroOverlay'
import { DesafioModal } from '../game/desafio/DesafioModal'
import { QuizModal } from '../game/quiz/QuizModal'
import { Mentor } from '../game/mentor/Mentor'
import { PhaseRouter } from '../game/phases/PhaseRouter'
import { StarsFall } from '../game/StarsFall'
import { SENSO_COR, SENSO_NOME, sensoFromPhase } from '../game/sensoInfo'
import { useGameStore } from '../store/gameStore'
import type { GameState } from '../types'
import { SENSO_ORDER } from '../types'
import { Button } from '../ui/Button'
import { Onboarding } from './Onboarding'

interface Props {
  state: GameState
}

const MATURIDADE_COR: Record<string, string> = {
  Bronze: '#cd7f32', Prata: '#b0bec5', Ouro: '#f9a825', Diamante: '#80deea',
}

export function GameScreen({ state }: Props): JSX.Element {
  const dispatch        = useGameStore((s) => s.dispatch)
  const onboarding      = useGameStore((s) => s.onboarding)
  const mentor          = useGameStore((s) => s.mentor)
  const senso           = sensoFromPhase(state.currentPhase)
  const ultimaFase      = state.currentPhase === 5
  const concluirBloqueado = ultimaFase && !state.shitsukeDesafio.sustentado
  const corSenso        = SENSO_COR[senso]

  const [introPhase, setIntroPhase] = useState<number | null>(null)
  const [showStars, setShowStars] = useState(false)
  const prevPhase = useRef<number | null>(null)

  useEffect(() => {
    const prev = prevPhase.current
    if (state.currentPhase !== prev) {
      prevPhase.current = state.currentPhase
      // Avançou de fase → estrelas!
      if (prev !== null && state.currentPhase > prev) {
        setShowStars(true)
      }
      setIntroPhase(state.currentPhase)
    }
  }, [state.currentPhase])

  const handleAvancar = async (): Promise<void> => {
    await dispatch('fase.avancar')
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">

      {/* ── HUD overlay no topo ── */}
      <header className="absolute left-0 right-0 top-0 z-20 flex items-center gap-3 px-5 py-3"
              style={{ background: 'linear-gradient(to bottom, rgba(6,21,40,0.92) 70%, transparent)' }}>

        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-black text-white shadow-lg"
               style={{ background: 'linear-gradient(135deg,#f47a20,#e05a00)' }}>
            5S
          </div>
          <span className="text-base font-black text-white">eKaizen</span>
        </div>

        {/* Fase atual */}
        <div className="shrink-0 rounded-lg px-3 py-1 text-xs font-bold text-white"
             style={{ background: `${corSenso}44`, border: `1px solid ${corSenso}88` }}>
          <span style={{ color: corSenso }}>Fase {state.currentPhase}/5</span>
          {' · '}
          <span className="text-white/90">{SENSO_NOME[senso]}</span>
        </div>

        {/* Trilha de sensos */}
        <div className="flex items-center gap-1.5">
          {SENSO_ORDER.map((k) => {
            const ativo = k === senso
            const liberado = state.unlocked.includes(k)
            const cor = SENSO_COR[k]
            return (
              <motion.div key={k}
                animate={{ scale: ativo ? 1.2 : 1 }}
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: ativo || liberado ? cor : 'rgba(255,255,255,0.2)',
                         boxShadow: ativo ? `0 0 8px ${cor}` : 'none' }} />
            )
          })}
        </div>

        {/* Métricas */}
        <div className="ml-auto flex items-center gap-4">
          <Metrica label="5S Score" valor={`${state.score5s}`}
                   sub={state.maturidade} subCor={MATURIDADE_COR[state.maturidade] ?? '#f47a20'} />
          <Metrica label="Pontos" valor={`${state.score}`} destaque />
          <Metrica label="Streak" valor={`🔥 ${state.streak}`} />
        </div>

        {/* Indicador acerto/erro */}
        <AnimatePresence>
          {mentor.correto !== null && (
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 16 }}
              className="text-3xl"
            >
              {mentor.correto ? '✅' : '❌'}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Minigame — tela toda ── */}
      <PhaseRouter state={state} />

      {/* ── Botão avançar — overlay canto inferior direito ── */}
      <div className="absolute bottom-5 right-5 z-20">
        <Button onClick={() => void handleAvancar()} disabled={concluirBloqueado}>
          {ultimaFase ? '🏆 Concluir jornada' : '➡ Avançar fase'}
        </Button>
      </div>

      {/* ── Aroldo — canto superior esquerdo ── */}
      <div className="pointer-events-none absolute left-4 top-20 z-30">
        <div className="pointer-events-auto">
          <Mentor />
        </div>
      </div>

      <AnimatePresence>
        {state.desafio !== null && !state.desafio.resolvido && <DesafioModal desafio={state.desafio} />}
      </AnimatePresence>
      <AnimatePresence>
        {state.quizConceitual !== null && <QuizModal quiz={state.quizConceitual} />}
      </AnimatePresence>
      <AnimatePresence>{onboarding && <Onboarding />}</AnimatePresence>
      <AnimatePresence>
        {introPhase !== null && !onboarding && (
          <PhaseIntroOverlay key={introPhase} phase={introPhase} onDone={() => setIntroPhase(null)} />
        )}
      </AnimatePresence>

      {/* Estrelas caindo ao concluir fase */}
      {showStars && <StarsFall onDone={() => setShowStars(false)} />}
    </div>
  )
}

function Metrica({ label, valor, sub, subCor, destaque }: {
  label: string; valor: string; sub?: string; subCor?: string; destaque?: boolean
}): JSX.Element {
  return (
    <div className="text-center">
      <p className="text-[9px] uppercase tracking-widest text-white/50">{label}</p>
      <p className={`font-extrabold leading-tight ${destaque ? 'text-lg text-marca-laranja' : 'text-base text-white'}`}>
        {valor}
      </p>
      {sub !== undefined && (
        <span className="mt-0.5 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white"
              style={{ background: subCor ?? '#f47a20' }}>
          {sub}
        </span>
      )}
    </div>
  )
}
