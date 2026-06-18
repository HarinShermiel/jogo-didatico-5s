// SEIKETSU — Padronizar. Tire um snapshot do padrão; os itens embaralham e
// você compara cada um com a foto de referência: conforme ou desvio de posição.
import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import type { SeiketsuPhase as SeiketsuData, SeiketsuItem, SeiketsuSlot } from '../../types'
import { Button } from '../../ui/Button'
import { ItemFigure } from '../ItemFigure'
import { PhaseBackground } from '../PhaseBackground'

interface Props {
  fase: SeiketsuData
}

export function SeiketsuPhase({ fase }: Props): JSX.Element {
  const dispatch = useGameStore((s) => s.dispatch)

  // Fase 1: memorizar o padrão antes de fotografar.
  if (!fase.snapshot) {
    return (
      <PhaseBackground senso="SEIKETSU">
      <div className="flex min-h-screen items-center justify-center p-4 pt-24">
        <div className="w-full max-w-3xl space-y-5 text-center">
          <div>
            <h2 className="text-lg font-black text-white">📐 Memorize o Padrão</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-white/70">
              Grave a posição de cada item: esta é a referência. Ao fotografar, eles vão se embaralhar.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {fase.atual.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
          <div className="flex justify-center pt-2">
            <Button onClick={() => void dispatch('seiketsu.snapshot', {})} className="px-7 py-3 text-base">
              📸 Tirar snapshot do padrão
            </Button>
          </div>
        </div>
      </div>
      </PhaseBackground>
    )
  }

  // Fase 2: comparar a fileira atual com a referência fotografada.
  const avaliados = fase.atual.filter((s) => s.avaliado !== null).length
  const concluido = avaliados === fase.atual.length && fase.atual.length > 0

  return (
    <PhaseBackground senso="SEIKETSU">
    <div className="flex min-h-screen items-center justify-center p-4 pt-24">
      <div className="w-full max-w-3xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white">📐 Auditoria do Padrão</h2>
            <p className="text-sm text-white/70">
              Compare com a foto: <b>conforme</b> (mesma posição) ou <b>desvio</b> (mudou de lugar).
            </p>
          </div>
          <div
            className="rounded-full px-4 py-1.5 text-sm font-extrabold text-white shadow-lg transition-colors"
            style={{ background: concluido ? '#3FA34D' : '#f47a20' }}
          >
            {avaliados}/{fase.atual.length} ✓
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {fase.atual.map((slot) => (
            <SlotCard
              key={slot.id}
              slot={slot}
              onAvaliar={(desvio) => void dispatch('seiketsu.avaliar', { spotId: slot.id, desvio })}
            />
          ))}
        </div>

        <div className="rounded-3xl bg-marca-azul/40 p-3 ring-1 ring-marca-laranja/40">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-marca-laranja">
            📸 Padrão (referência)
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {fase.referencia.map((item) => (
              <ItemCard key={item.id} item={item} compact />
            ))}
          </div>
        </div>
      </div>
    </div>
    </PhaseBackground>
  )
}

function ItemCard({ item, compact = false }: { item: SeiketsuItem; compact?: boolean }): JSX.Element {
  return (
    <motion.div
      layout
      className="flex flex-col items-center rounded-2xl bg-white p-3 text-center shadow-lg"
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
    >
      <ItemFigure emoji={item.emoji} size={compact ? 36 : 56} />
      <p className={`mt-1 font-bold text-marca-azul ${compact ? 'text-[10px]' : 'text-xs'}`}>{item.nome}</p>
    </motion.div>
  )
}

interface SlotProps {
  slot: SeiketsuSlot
  onAvaliar: (desvio: boolean) => void
}

function SlotCard({ slot, onAvaliar }: SlotProps): JSX.Element {
  return (
    <motion.div
      layout
      className="flex flex-col items-center rounded-2xl bg-white p-3 text-center shadow-xl"
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
    >
      <ItemFigure emoji={slot.emoji} size={56} />
      <p className="mt-1 text-xs font-bold text-marca-azul">{slot.nome}</p>
      {slot.avaliado === null ? (
        <div className="mt-2 flex w-full gap-1.5">
          <button
            onClick={() => onAvaliar(false)}
            className="flex-1 rounded-xl bg-senso-seiso px-1 py-1.5 text-[11px] font-bold text-white transition hover:brightness-110"
            aria-label={`${slot.nome} está na posição do padrão (conforme)`}
          >
            ✓ Conforme
          </button>
          <button
            onClick={() => onAvaliar(true)}
            className="flex-1 rounded-xl bg-senso-seiri px-1 py-1.5 text-[11px] font-bold text-white transition hover:brightness-110"
            aria-label={`${slot.nome} mudou de posição (desvio)`}
          >
            ⚠ Desvio
          </button>
        </div>
      ) : (
        <motion.p
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 18 }}
          className={`mt-2 text-xs font-bold ${slot.acertou ? 'text-senso-seiso' : 'text-red-500'}`}
        >
          {slot.acertou ? '✅ ' : '❌ '}
          {slot.avaliado ? 'Desvio' : 'Conforme'}
        </motion.p>
      )}
    </motion.div>
  )
}
