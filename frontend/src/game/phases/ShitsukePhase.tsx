// SHITSUKE — Quiz de sustentação sob pressão.
// Situações do banco aparecem uma por vez com timer de 10s.
// Acertou → radar sobe. Errou/timeout → radar cai.
// Mantenha média ≥ 50 por 30s contínuos para concluir.
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { PhaseBackground } from '../PhaseBackground'

const SENSOS = [
  { id: 1, nome: 'Seiri',    emoji: '🗂️',  cor: '#E4572E', desc: 'Utilização' },
  { id: 2, nome: 'Seiton',   emoji: '📦',  cor: '#F4A261', desc: 'Ordenação' },
  { id: 3, nome: 'Seiso',    emoji: '🧹',  cor: '#2EC4B6', desc: 'Limpeza' },
  { id: 4, nome: 'Seiketsu', emoji: '📋',  cor: '#8338EC', desc: 'Padronização' },
  { id: 5, nome: 'Shitsuke', emoji: '🏅',  cor: '#3FA34D', desc: 'Disciplina' },
]

const TEMPO_POR_PERGUNTA = 10  // segundos

interface Props {
  itens: unknown[]
}

export function ShitsukePhase({ itens: _ }: Props): JSX.Element {
  const dispatch       = useGameStore((s) => s.dispatch)
  const score5s        = useGameStore((s) => s.state?.score5s ?? 0)
  const radar          = useGameStore((s) => s.state?.radar ?? {})
  const desafio        = useGameStore((s) => s.state?.shitsukeDesafio)

  const meta           = desafio?.metaMedia ?? 50
  const duracao        = desafio?.duracaoSeg ?? 30
  const sustentado     = desafio?.sustentado ?? false
  const restanteServ   = desafio?.restanteSeg ?? duracao
  const pergunta       = desafio?.pergunta as { situacaoId: number; texto: string } | null | undefined
  const acimaMeta      = score5s >= meta

  // Cronômetro dos 30s — conta localmente, re-sincroniza com o servidor
  const [restante, setRestante] = useState(restanteServ)
  useEffect(() => setRestante(restanteServ), [restanteServ])
  useEffect(() => {
    if (sustentado || !acimaMeta) return
    const id = setInterval(() => setRestante((r) => Math.max(0, r - 0.1)), 100)
    return () => clearInterval(id)
  }, [sustentado, acimaMeta, restanteServ])

  // Timer por pergunta
  const [tempoRestante, setTempoRestante] = useState(TEMPO_POR_PERGUNTA)
  const perguntaIdRef = useRef<number | null>(null)
  const timeoutDisparado = useRef(false)
  const [respondendo, setRespondendo]     = useState(false)
  const [feedback, setFeedback]           = useState<'correto' | 'errado' | null>(null)

  // Reseta o timer quando muda a pergunta
  useEffect(() => {
    const novaPerguntaId = pergunta?.situacaoId ?? null
    if (novaPerguntaId !== perguntaIdRef.current) {
      perguntaIdRef.current = novaPerguntaId
      timeoutDisparado.current = false
      setTempoRestante(TEMPO_POR_PERGUNTA)
      setFeedback(null)
      setRespondendo(false)
    }
  }, [pergunta?.situacaoId])

  // Countdown do timer da pergunta
  useEffect(() => {
    if (sustentado || pergunta == null || feedback !== null) return
    if (tempoRestante <= 0) {
      if (!timeoutDisparado.current) {
        timeoutDisparado.current = true
        void dispatch('shitsuke.responder', { timeout: true })
        setFeedback('errado')
      }
      return
    }
    const id = setInterval(() => setTempoRestante((t) => Math.max(0, t - 0.1)), 100)
    return () => clearInterval(id)
  }, [tempoRestante, pergunta, sustentado, feedback, dispatch])

  const responder = (sensoId: number) => {
    if (respondendo || feedback !== null || pergunta == null) return
    setRespondendo(true)
    void dispatch('shitsuke.responder', { senso: sensoId }).then(() => {
      // feedback é mostrado via estado do servidor (score5s sobe/cai)
      setRespondendo(false)
    })
  }

  const mostrado = sustentado ? 0 : acimaMeta ? restante : duracao
  const fracCrono = duracao > 0 ? Math.max(0, Math.min(1, mostrado / duracao)) : 0
  const fracTimer = Math.max(0, Math.min(1, tempoRestante / TEMPO_POR_PERGUNTA))

  return (
    <PhaseBackground senso="SHITSUKE">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-5 p-4 pt-16">

        {/* ── HUD: Radar bars + cronômetro ───────────────────── */}
        <div className="w-full flex items-center gap-4 rounded-3xl bg-white/10 p-4 shadow-xl backdrop-blur">
          <CronometroCircular frac={fracCrono} segundos={mostrado} sustentado={sustentado} acimaMeta={acimaMeta} />
          <div className="flex-1 space-y-1.5">
            {SENSOS.map((s) => {
              const val = (radar as Record<string, number>)[s.nome.toUpperCase()] ?? 0
              return (
                <div key={s.id} className="flex items-center gap-2">
                  <span className="text-base w-5 text-center">{s.emoji}</span>
                  <div className="flex-1 h-3 rounded-full bg-white/15 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: s.cor }}
                      animate={{ width: `${val}%` }}
                      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-white/60 w-7 text-right">{Math.round(val)}</span>
                </div>
              )
            })}
            {/* Linha da meta */}
            <div className="relative h-0">
              <div
                className="absolute bottom-0 w-0.5 h-10 bg-white/50 pointer-events-none"
                style={{ left: `calc(${meta}% + 1.625rem)`, bottom: 0, position: 'absolute', top: '-42px' }}
              />
            </div>
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-[10px] text-white/50">meta: {meta}</span>
              <motion.span
                className="text-sm font-extrabold"
                animate={{ color: acimaMeta ? '#3FA34D' : '#E4572E' }}
              >
                {score5s.toFixed(0)} média
              </motion.span>
            </div>
          </div>
        </div>

        {/* ── Quiz card ──────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {sustentado ? (
            <motion.div
              key="concluido"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full rounded-3xl bg-green-500/20 border-2 border-green-400 p-8 text-center shadow-2xl"
            >
              <p className="text-5xl mb-3">🏆</p>
              <p className="text-xl font-black text-white">Padrão sustentado!</p>
              <p className="text-sm text-white/70 mt-1">Você manteve o 5S sob pressão. Pode avançar.</p>
            </motion.div>
          ) : pergunta != null ? (
            <motion.div
              key={pergunta.situacaoId}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="w-full rounded-3xl bg-white/10 backdrop-blur p-5 shadow-2xl space-y-4"
            >
              {/* Timer bar */}
              <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: fracTimer > 0.4 ? '#3FA34D' : fracTimer > 0.2 ? '#F4A261' : '#E4572E' }}
                  animate={{ width: `${fracTimer * 100}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>

              {/* Situação */}
              <div className="rounded-2xl bg-white/10 px-4 py-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1">Situação</p>
                <p className="text-base font-semibold text-white leading-snug">{pergunta.texto}</p>
              </div>

              <p className="text-xs font-bold text-white/60 text-center">Qual senso resolve essa situação?</p>

              {/* Botões dos 5 sensos */}
              <div className="grid grid-cols-5 gap-2">
                {SENSOS.map((s) => (
                  <motion.button
                    key={s.id}
                    onClick={() => responder(s.id)}
                    disabled={respondendo || feedback !== null}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.93 }}
                    className="flex flex-col items-center rounded-2xl py-3 px-1 text-center font-bold text-white shadow-lg transition disabled:opacity-50"
                    style={{ background: s.cor + 'cc', border: `2px solid ${s.cor}` }}
                  >
                    <span className="text-2xl">{s.emoji}</span>
                    <span className="text-[10px] mt-0.5 leading-tight">{s.nome}</span>
                    <span className="text-[9px] text-white/70 leading-tight">{s.desc}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="aguardando"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full rounded-3xl bg-white/10 p-8 text-center"
            >
              <p className="text-white/60 text-sm">Aguardando próxima situação...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dica de status */}
        {!sustentado && (
          <p className="text-center text-xs text-white/50">
            {acimaMeta
              ? `⏱ Mantenha por mais ${Math.ceil(mostrado)}s para concluir`
              : `⚠️ Radar abaixo da meta — responda certo para subir`}
          </p>
        )}
      </div>
    </PhaseBackground>
  )
}

// ─── Cronômetro circular dos 30s ─────────────────────────────────────────────
function CronometroCircular({
  frac, segundos, sustentado, acimaMeta,
}: {
  frac: number; segundos: number; sustentado: boolean; acimaMeta: boolean
}): JSX.Element {
  const raio = 34
  const circ = 2 * Math.PI * raio
  const cor  = sustentado ? '#3FA34D' : acimaMeta ? '#C9A227' : '#9ca3af'
  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
        <circle cx="40" cy="40" r={raio} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="7" />
        <motion.circle
          cx="40" cy="40" r={raio} fill="none"
          stroke={cor} strokeWidth="7" strokeLinecap="round"
          strokeDasharray={circ}
          style={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - frac) }}
          transition={{ ease: 'linear', duration: 0.12 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold text-white">{sustentado ? '✓' : Math.ceil(segundos)}</span>
        <span className="text-[9px] font-semibold uppercase tracking-wide text-white/60">
          {sustentado ? 'feito' : 'seg'}
        </span>
      </div>
    </div>
  )
}
