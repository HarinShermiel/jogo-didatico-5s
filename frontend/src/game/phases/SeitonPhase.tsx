// SEITON — Slots absolutamente posicionados nas prateleiras reais do fundo.
// Um slot por vez aparece (silhueta piscando). Itens passam na esteira.
import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import type { SeitonItem } from '../../types'
import { ItemFigure } from '../ItemFigure'

const SLOT_W = 200
const BELT_H = 148

// Posições absolutas sobre as estantes do fundo — 3 colunas × 3 fileiras.
// Colunas: esq 37%, centro 50%, dir 63% da largura total.
// Fileiras: os itens ficam SOBRE a prateleira, transform ancora na base do item.
// 1ª prateleira ~30%, 2ª ~54%, 3ª ~76% do topo da área de prateleira.
const SHELF_POSITIONS = [
  { left: '37%', top: '40%' },  // 0 — esq,    1ª fileira
  { left: '50%', top: '40%' },  // 1 — centro, 1ª fileira
  { left: '63%', top: '40%' },  // 2 — dir,    1ª fileira
  { left: '37%', top: '54%' },  // 3 — esq,    2ª fileira
  { left: '50%', top: '54%' },  // 4 — centro, 2ª fileira
  { left: '63%', top: '54%' },  // 5 — dir,    2ª fileira
  { left: '37%', top: '70%' },  // 6 — esq,    3ª fileira
  { left: '50%', top: '70%' },  // 7 — centro, 3ª fileira
  { left: '63%', top: '70%' },  // 8 — dir,    3ª fileira
]

interface Props {
  itens: SeitonItem[]
}

export function SeitonPhase({ itens }: Props): JSX.Element {
  const dispatch  = useGameStore((s) => s.dispatch)
  const colocados = itens.filter((i) => i.encaixadoEm === i.slot)
  const concluido = colocados.length === itens.length && itens.length > 0
  const alvo      = itens.find((i) => i.encaixadoEm === null) ?? null

  const [bloqueado, setBloqueado] = useState(false)
  const [errou, setErrou]         = useState<string | null>(null)

  // Embaralha a ordem da esteira uma única vez no mount
  const ordemEsteira = useMemo(() => {
    const arr = [...itens]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
    }
    return arr
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const tentar = (itemId: string, slot: string): void => {
    if (bloqueado) return
    setBloqueado(true)
    void dispatch('seiton.encaixar', { itemId, slot }).then(() => {
      const { state } = useGameStore.getState()
      const depois = state?.phases.SEITON.find((i: SeitonItem) => i.id === itemId)
      if (depois?.encaixadoEm === slot) {
        setBloqueado(false)
      } else {
        setErrou(itemId)
        setTimeout(() => { setErrou(null); setBloqueado(false) }, 1600)
      }
    })
  }

  const onSlotDragOver = (e: React.DragEvent): void => { e.preventDefault() }
  const onSlotDrop     = (e: React.DragEvent, slot: string): void => {
    e.preventDefault()
    const id = e.dataTransfer.getData('itemId')
    if (id !== '') tentar(id, slot)
  }

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ backgroundImage: 'url(/bancada-seiton.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0 bg-black/25" />

      {/* ── HUD ────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-3 pb-2 shrink-0">
        <p className="text-sm font-bold text-white drop-shadow-lg">
          {alvo !== null
            ? <>Arraste <span className="text-marca-laranja font-black">{alvo.nome}</span> para o slot piscando na prateleira</>
            : '🏆 Tudo no lugar!'}
        </p>
        <div
          className="rounded-full px-3 py-1 text-sm font-extrabold text-white shadow-lg"
          style={{ background: concluido ? '#3FA34D' : '#f47a20' }}
        >
          {colocados.length}/{itens.length} ✓
        </div>
      </div>

      {/* ── Área das prateleiras — ocupa tudo acima da esteira ───────── */}
      <div
        className="relative z-10 flex-1"
        style={{ marginBottom: BELT_H }}
      >
        {itens.map((item, idx) => {
          const pos      = SHELF_POSITIONS[idx % SHELF_POSITIONS.length] ?? SHELF_POSITIONS[0]!
          const colocado = item.encaixadoEm === item.slot
          const éAlvo   = alvo?.id === item.id && !colocado

          return (
            <motion.div
              key={item.slot}
              onDragOver={onSlotDragOver}
              onDrop={(e) => onSlotDrop(e, item.slot)}
              className="absolute flex flex-col items-center justify-end rounded-xl"
              style={{
                left: pos.left,
                top:  pos.top,
                transform: 'translate(-50%, -100%)',  // centraliza no ponto e ancora na base da prateleira
                width: 90,
                height: 90,
              }}
              animate={
                éAlvo
                  ? {
                      backgroundColor: ['rgba(244,122,32,0.0)', 'rgba(244,122,32,0.15)', 'rgba(244,122,32,0.0)'],
                      boxShadow: ['0 0 0px rgba(244,122,32,0)', '0 0 28px rgba(244,122,32,0.7)', '0 0 0px rgba(244,122,32,0)'],
                    }
                  : colocado
                    ? { backgroundColor: 'rgba(63,163,77,0.1)', boxShadow: '0 0 16px rgba(63,163,77,0.4)' }
                    : { backgroundColor: 'transparent', boxShadow: 'none' }
              }
              transition={éAlvo ? { duration: 0.8, repeat: Infinity } : { duration: 0.2 }}
            >
              <AnimatePresence mode="wait">
                {colocado ? (
                  <motion.div key="ok" className="flex flex-col items-center gap-0.5"
                    initial={{ scale: 0, y: 12 }} animate={{ scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 18 }}>
                    <ItemFigure emoji={item.emoji} size={52} />
                    <span className="text-[8px] font-bold text-white text-center leading-tight drop-shadow-lg">{item.nome}</span>
                    <span className="text-green-400 text-xs">✅</span>
                  </motion.div>
                ) : éAlvo ? (
                  <motion.div key="silhueta" className="flex flex-col items-center gap-0.5"
                    animate={{ opacity: [0.15, 0.85, 0.15] }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}>
                    <ItemFigure emoji={item.emoji} size={50} grayscale />
                    <span className="text-[9px] font-black text-marca-laranja drop-shadow-lg">aqui!</span>
                  </motion.div>
                ) : (
                  <div key="vazio" />
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}

        <AnimatePresence>
          {concluido && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-2xl bg-green-500/85 px-8 py-3 text-center font-black text-white shadow-xl whitespace-nowrap"
            >
              🏆 Tudo no lugar! Avance para o próximo senso.
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Esteira ─────────────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 z-10 overflow-hidden" style={{ height: BELT_H }}>
        <div className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, #1c2233 0%, #0e1320 100%)',
            borderTop: '5px solid #2d3748',
          }}
        />
        <BeltStripes />
        <div className="absolute top-2 bottom-2 left-0 w-3"
          style={{ background: 'linear-gradient(90deg, #374151, #4b5563)' }} />
        <div className="absolute top-2 bottom-2 right-0 w-3"
          style={{ background: 'linear-gradient(270deg, #374151, #4b5563)' }} />

        {concluido ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm font-bold text-white/40">Esteira vazia</p>
          </div>
        ) : (
          <Belt itens={ordemEsteira} errou={errou} />
        )}
      </div>

      <style>{`
        @keyframes belt-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes belt-stripe {
          from { transform: skewX(-20deg) translateX(0); }
          to   { transform: skewX(-20deg) translateX(-64px); }
        }
      `}</style>
    </div>
  )
}

function BeltStripes(): JSX.Element {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity: 0.15 }}>
      {Array.from({ length: 32 }, (_, i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0 bg-white"
          style={{ left: `${i * 64}px`, width: '32px', animation: 'belt-stripe 1.4s linear infinite' }}
        />
      ))}
    </div>
  )
}

function Belt({
  itens, errou,
}: {
  itens: SeitonItem[]
  errou: string | null
}): JSX.Element {
  // Array fixo (todos os itens, sempre) → animation nunca reinicia
  const loop     = [...itens, ...itens]
  const totalPx  = itens.length * SLOT_W
  const duration = itens.length * 4.5

  return (
    <div className="absolute inset-0 flex items-center overflow-hidden">
      <div
        style={{
          display: 'flex',
          width: totalPx * 2,
          animation: `belt-scroll ${duration}s linear infinite`,
          willChange: 'transform',
        }}
      >
        {loop.map((item, idx) => {
          const isErrou    = item.id === errou
          const colocado   = item.encaixadoEm === item.slot
          return (
            <div
              key={`${item.id}-${idx}`}
              style={{ width: SLOT_W, display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}
            >
              <motion.div
                animate={isErrou ? { x: [0, -10, 10, -8, 8, 0], rotate: [0, -5, 5, -3, 3, 0] } : {}}
                transition={isErrou ? { duration: 0.45 } : {}}
              >
                <div
                  draggable={!colocado}
                  onDragStart={(e: React.DragEvent) => {
                    if (colocado) { e.preventDefault(); return }
                    e.dataTransfer.setData('itemId', item.id)
                  }}
                  className="flex flex-col items-center rounded-xl bg-white px-3 py-3 shadow-xl select-none"
                  style={{
                    border:  '2px solid rgba(0,0,0,0.1)',
                    opacity: colocado ? 0.25 : 1,
                    cursor:  colocado ? 'default' : 'grab',
                    width: 88,
                  }}
                >
                  <ItemFigure emoji={item.emoji} size={44} />
                  <span className="mt-1 text-[9px] font-bold text-center text-marca-azul leading-tight">{item.nome}</span>
                  {colocado && <span className="text-green-500 text-[10px]">✅</span>}
                </div>
              </motion.div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
