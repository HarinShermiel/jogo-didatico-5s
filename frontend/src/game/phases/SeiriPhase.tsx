// SEIRI — Um item por vez, centralizado na bancada.
// Acerto: item voa até a caixa e some. Erro: item volta ao centro com explicação.
import { AnimatePresence, motion } from 'framer-motion'
import { useRef, useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import type { SeiriItem } from '../../types'
import { Draggable } from '../dnd/Draggable'
import { itemImg } from '../itemImg'

const ZONAS: { id: string; imagem: string; cor: string; label: string }[] = [
  { id: 'manter',    imagem: '/caixa-manter.png',    cor: '#3FA34D', label: 'Manter'            },
  { id: 'red_tag',   imagem: '/caixa-red-tag.png',   cor: '#C9A227', label: 'Etiqueta Vermelha' },
  { id: 'descartar', imagem: '/caixa-descartar.png', cor: '#E4572E', label: 'Descartar'         },
]

interface Vec { x: number; y: number }
interface FlyState { from: Vec; to: Vec; correto: boolean }

interface Props {
  itens: SeiriItem[]
}

export function SeiriPhase({ itens }: Props): JSX.Element {
  const dispatch  = useGameStore((s) => s.dispatch)
  const pendentes = itens.filter((i) => i.resolvido === null)
  const atual     = pendentes[0] ?? null
  const total     = itens.length
  const feitos    = total - pendentes.length

  const itemRef   = useRef<HTMLDivElement>(null)
  const caixaRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const [fly, setFly]                 = useState<FlyState | null>(null)
  const [caixaBounce, setCaixaBounce] = useState<string | null>(null)
  const [errou, setErrou]             = useState(false)
  // bloqueado: impede nova jogada enquanto o Aroldo fala
  const [bloqueado, setBloqueado]     = useState(false)

  const classificar = (zona: string, dropPoint?: Vec): void => {
    if (atual === null || bloqueado) return

    const itemEl  = itemRef.current
    const caixaEl = caixaRefs.current[zona]

    let origem: Vec = { x: 0, y: 0 }
    if (itemEl) {
      const iR = itemEl.getBoundingClientRect()
      origem = dropPoint ?? { x: iR.left + iR.width / 2, y: iR.top + iR.height / 2 }
    }

    let destino: Vec = origem
    if (caixaEl) {
      const cR = caixaEl.getBoundingClientRect()
      destino = { x: cR.left + cR.width / 2, y: cR.top + cR.height / 2 }
    }

    setBloqueado(true)
    setErrou(false)
    setFly({ from: origem, to: destino, correto: true })
    setCaixaBounce(zona)

    setTimeout(() => {
      void dispatch('seiri.classificar', { itemId: atual.id, zona }).then(() => {
        const { state } = useGameStore.getState()
        const aindaPendente = state?.phases.SEIRI.find((i: SeiriItem) => i.id === atual.id)?.resolvido === null

        setFly(null)
        setCaixaBounce(null)

        if (aindaPendente) {
          // Errou — shake + desbloqueio após Aroldo falar
          setErrou(true)
          setTimeout(() => {
            setErrou(false)
            setBloqueado(false)
          }, 2000)
        } else {
          setBloqueado(false)
        }
      })
    }, 420)
  }

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{
        backgroundImage: 'url(/bancada-seiri.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
      }}
    >
      <div className="absolute inset-0 bg-black/30" />

      {/* Barra de progresso */}
      <div className="absolute left-0 right-0 top-16 z-10 px-10">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-3 overflow-hidden rounded-full bg-white/20">
            <motion.div
              className="h-full rounded-full bg-marca-laranja"
              animate={{ width: `${(feitos / total) * 100}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            />
          </div>
          <span className="text-sm font-bold text-white/80">{feitos}/{total}</span>
        </div>
      </div>

      {/* Item centralizado na mesa */}
      <div className="relative z-20 flex flex-1 items-center justify-center">
        <AnimatePresence mode="wait">
          {atual !== null && fly === null && (
            <motion.div
              key={atual.id + '-idle'}
              ref={itemRef}
              initial={{ scale: 0.5, opacity: 0, y: -40 }}
              animate={
                errou
                  ? { scale: 1, opacity: 1, y: 0, x: [0, -14, 14, -10, 10, -6, 6, 0] }
                  : { scale: 1, opacity: 1, y: 0, x: 0 }
              }
              transition={
                errou
                  ? { duration: 0.5, ease: 'easeOut' }
                  : { type: 'spring', stiffness: 300, damping: 22 }
              }
            >
              <Draggable
                ariaLabel={`${atual.nome}. ${atual.dica}. Arraste para a caixa correta.`}
                onDrop={classificar}
              >
                <ItemCard item={atual} />
              </Draggable>
            </motion.div>
          )}

          {atual === null && fly === null && (
            <motion.div
              key="done"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1,   opacity: 1 }}
              className="rounded-3xl bg-green-500/85 px-10 py-6 text-center shadow-2xl backdrop-blur-sm"
            >
              <p className="text-4xl">🏆</p>
              <p className="mt-2 text-xl font-black text-white">Bancada separada!</p>
              <p className="mt-1 text-sm text-white/80">Clique em Avançar fase para continuar.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Item voando até a caixa */}
      <AnimatePresence>
        {atual !== null && fly !== null && (
          <motion.div
            key={atual.id + '-fly'}
            className="pointer-events-none fixed z-30"
            style={{ left: 0, top: 0, x: '-50%', y: '-50%' }}
            initial={{ left: fly.from.x, top: fly.from.y, scale: 1, opacity: 1 }}
            animate={{ left: fly.to.x,   top: fly.to.y,   scale: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 1, 1] }}
          >
            <ItemCard item={atual} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Caixas */}
      <div
        className="relative z-10 grid grid-cols-3 overflow-visible"
        style={{ background: '#c4a882' }}
      >
        {ZONAS.map((z) => (
          <CaixaZona
            key={z.id}
            zona={z}
            bounce={caixaBounce === z.id}
            onDrop={classificar}
            refCallback={(el) => { caixaRefs.current[z.id] = el }}
          />
        ))}
      </div>
    </div>
  )
}

function CaixaZona({
  zona, bounce, onDrop, refCallback,
}: {
  zona: { id: string; imagem: string; cor: string; label: string }
  bounce: boolean
  onDrop: (zona: string) => void
  refCallback: (el: HTMLDivElement | null) => void
}): JSX.Element {
  return (
    <motion.div
      ref={refCallback}
      data-zone={zona.id}
      onClick={() => onDrop(zona.id)}
      className="group flex cursor-pointer flex-col items-center justify-end py-6"
      style={{ borderTop: `5px solid ${zona.cor}`, background: '#c4a882' }}
      animate={bounce ? { y: [0, -20, 8, -6, 2, 0] } : { y: 0 }}
      transition={bounce ? { duration: 0.5, ease: 'easeOut' } : {}}
    >
      <div
        className="flex items-center justify-center"
        style={{ width: 240, height: 240, background: '#c4a882' }}
      >
        <img
          src={zona.imagem}
          alt={zona.label}
          draggable={false}
          className="transition duration-150 group-hover:brightness-110"
          style={{ mixBlendMode: 'multiply', width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>
    </motion.div>
  )
}

function ItemCard({ item }: { item: SeiriItem }): JSX.Element {
  const imgSrc = itemImg(item.emoji)
  return (
    <motion.div
      className="flex w-52 flex-col items-center rounded-3xl bg-white p-5 text-center shadow-2xl"
      whileHover={{ y: -6, scale: 1.04 }}
      style={{ border: '3px solid rgba(0,0,0,0.06)', cursor: 'grab' }}
    >
      {imgSrc !== undefined ? (
        <img
          src={imgSrc}
          alt={item.nome}
          className="h-28 w-28 object-contain drop-shadow-md"
          draggable={false}
        />
      ) : (
        <span className="text-7xl drop-shadow-md" aria-hidden="true">{item.emoji}</span>
      )}
      <span className="mt-3 text-base font-black text-marca-azul">{item.nome}</span>
      <span className="mt-1 text-sm text-gray-500 leading-snug">{item.dica}</span>
    </motion.div>
  )
}
