// Painel de status sempre visível: 5S Score, selo, streak e trilha das 5 fases.
import { motion } from 'framer-motion'
import type { GameState } from '../types'
import { SENSO_ORDER } from '../types'
import { SENSO_COR, SENSO_SIMBOLO, sensoFromPhase } from './sensoInfo'

interface Props {
  state: GameState
}

const MATURIDADE_COR: Record<string, string> = {
  Bronze:   '#cd7f32',
  Prata:    '#b0bec5',
  Ouro:     '#f9a825',
  Diamante: '#80deea',
}

export function Hud({ state }: Props): JSX.Element {
  const atual = sensoFromPhase(state.currentPhase)
  const corMaturidade = MATURIDADE_COR[state.maturidade] ?? '#f47a20'

  return (
    <div className="space-y-3">
      {/* Métricas */}
      <div className="flex items-stretch justify-between gap-2 rounded-2xl bg-white/10 p-3 text-white backdrop-blur-sm"
           style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
        <Metric
          label="5S Score"
          valor={`${state.score5s}`}
          sufixo={state.maturidade}
          sufixoCor={corMaturidade}
        />
        <div className="w-px bg-white/20" />
        <Metric label="Pontos" valor={`${state.score}`} destaque />
        <div className="w-px bg-white/20" />
        <Metric label="Streak" valor={`🔥 ${state.streak}`} />
      </div>

      {/* Trilha de fases */}
      <ol className="flex items-center justify-between gap-1" aria-label="Progresso das fases">
        {SENSO_ORDER.map((k, i) => {
          const ativo = k === atual
          const liberado = state.unlocked.includes(k)
          const cor = SENSO_COR[k]

          return (
            <li key={k} className="flex flex-1 flex-col items-center gap-1">
              {/* Linha conectora */}
              {i > 0 && (
                <div
                  className="absolute"
                  aria-hidden="true"
                />
              )}
              <motion.div
                animate={ativo ? { scale: [1, 1.18, 1.12], y: -2 } : { scale: liberado ? 1.05 : 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="relative flex h-10 w-10 items-center justify-center rounded-full text-base font-bold text-white shadow-lg"
                style={{
                  background: liberado || ativo
                    ? `linear-gradient(135deg, ${cor}ee, ${cor}99)`
                    : 'rgba(255,255,255,0.12)',
                  boxShadow: ativo
                    ? `0 0 0 3px white, 0 0 16px ${cor}88`
                    : liberado
                      ? `0 0 8px ${cor}55`
                      : 'none',
                }}
                title={k}
              >
                {SENSO_SIMBOLO[k]}
                {liberado && !ativo && (
                  <span
                    className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px]"
                    style={{ background: cor }}
                  >
                    ✓
                  </span>
                )}
              </motion.div>
              <span className="hidden text-[9px] font-bold uppercase tracking-wide text-white/60 sm:block">{k}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function Metric({
  label,
  valor,
  sufixo,
  sufixoCor,
  destaque,
}: {
  label: string
  valor: string
  sufixo?: string
  sufixoCor?: string
  destaque?: boolean
}): JSX.Element {
  return (
    <div className="flex flex-1 flex-col items-center text-center">
      <p className="text-[10px] uppercase tracking-widest text-white/50">{label}</p>
      <p className={`font-extrabold leading-tight ${destaque ? 'text-xl text-marca-laranja' : 'text-lg'}`}>
        {valor}
      </p>
      {sufixo !== undefined && (
        <span className="mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: sufixoCor ?? '#f47a20', color: '#fff' }}>
          {sufixo}
        </span>
      )}
    </div>
  )
}
