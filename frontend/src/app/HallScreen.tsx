// Hall 5S — tela final celebratória: veredito/selo, radar, antes & depois,
// badges conquistadas e certificado compartilhável.
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Radar } from '../game/radar/Radar'
import { useGameStore } from '../store/gameStore'
import type { GameState } from '../types'
import { Button } from '../ui/Button'

const TODAS_BADGES: Record<string, string> = {
  'Zero Refugo': '♻️',
  'Caçador de Anomalias': '🔎',
  'Olho de Águia': '🦅',
  'Sequência Perfeita': '🔥',
  'Mestre dos Sensos': '🏅',
}

const BADGE_DESC: Record<string, string> = {
  'Zero Refugo': 'Classificou todos os itens do Seiri corretamente, sem nenhum erro.',
  'Caçador de Anomalias': 'Registrou todas as anomalias reais no Seiso sem deixar nenhuma passar.',
  'Olho de Águia': 'Zero falsos positivos no Seiso e identificou todos os desvios no Seiketsu.',
  'Sequência Perfeita': 'Atingiu uma sequência de 10 acertos consecutivos.',
  'Mestre dos Sensos': 'Concluiu todos os 5 sensos com excelência.',
}

interface Props {
  state: GameState
}

export function HallScreen({ state }: Props): JSX.Element {
  const start = useGameStore((s) => s.start)
  const compartilhar = (): void => {
    const texto = `Concluí o eKaizen 5S como ${state.veredito} (${state.maturidade}) com 5S Score ${state.score5s}! 🏆`
    if (typeof navigator.share === 'function') void navigator.share({ text: texto })
    else void navigator.clipboard.writeText(texto)
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-8 text-white">
      <Confetti />
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
        <img src="/mentor/mentor-comemora.png" alt="Mestre 5S comemorando" className="mx-auto h-32 w-32 rounded-3xl object-cover shadow-2xl" />
        <p className="mt-3 text-sm font-bold uppercase tracking-widest text-marca-laranja">Hall 5S</p>
        <h1 className="text-4xl font-extrabold">{state.veredito}</h1>
        <p className="text-lg text-white/80">Selo {state.maturidade} · 5S Score {state.score5s} · {state.score} pts</p>
      </motion.div>

      <div className="mt-6 flex justify-center rounded-2xl bg-white/5 p-4">
        <Radar radar={state.radar} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Card titulo="🏚️ Antes" texto="Ferramentas largadas, refugo misturado, óleo no piso, etiquetas apagadas. Ninguém achava nada." />
        <Card titulo="✨ Depois" texto="Só o necessário, cada coisa no lugar, limpo e inspecionado, padrão visível e sustentado por hábito." />
      </div>

      <section className="mt-4 rounded-2xl bg-white/10 p-4">
        <h2 className="mb-2 font-bold">Badges conquistadas</h2>
        {state.badges.length === 0 ? (
          <p className="text-sm text-white/60">Nenhuma badge desta vez — jogue de novo e mire o ouro!</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {state.badges.map((b) => (
              <BadgeChip key={b} nome={b} icone={TODAS_BADGES[b] ?? '🏆'} desc={BADGE_DESC[b] ?? ''} />
            ))}
          </div>
        )}
      </section>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button onClick={compartilhar} variant="ghost">📤 Compartilhar certificado</Button>
        <Button onClick={() => void start()}>🔄 Jogar novamente</Button>
      </div>
    </main>
  )
}

function BadgeChip({ nome, icone, desc }: { nome: string; icone: string; desc: string }): JSX.Element {
  const [show, setShow] = useState(false)
  return (
    <div className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <span className="cursor-default rounded-full bg-marca-laranja/90 px-3 py-1 text-sm font-bold">
        {icone} {nome}
      </span>
      {show && desc !== '' && (
        <div className="absolute bottom-full left-1/2 z-10 mb-2 w-52 -translate-x-1/2 rounded-xl bg-gray-900 px-3 py-2 text-center text-xs text-white shadow-xl">
          {desc}
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  )
}

function Card({ titulo, texto }: { titulo: string; texto: string }): JSX.Element {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <h3 className="font-bold">{titulo}</h3>
      <p className="mt-1 text-sm text-white/80">{texto}</p>
    </div>
  )
}

function Confetti(): JSX.Element {
  const pedacos = Array.from({ length: 40 }, (_, i) => i)
  const cores = ['#F47A20', '#2E86AB', '#3FA34D', '#6A4C93', '#C9A227']
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      {pedacos.map((i) => (
        <motion.span
          key={i}
          className="absolute top-0 h-2 w-2 rounded-sm"
          style={{ left: `${(i * 97) % 100}%`, background: cores[i % cores.length] }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ y: '105vh', rotate: 360, opacity: 0.9 }}
          transition={{ duration: 2.4 + (i % 5) * 0.3, repeat: Infinity, delay: (i % 10) * 0.2, ease: 'linear' }}
        />
      ))}
    </div>
  )
}
