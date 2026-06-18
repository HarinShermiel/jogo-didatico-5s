// Fundo animado da tela inicial: "lava lamp" — blobs grandes desfocados nas
// cores dos sensos flutuando lentamente, com símbolos dos 5S subindo ao fundo.
// Puramente decorativo (aria-hidden); não captura cliques.
import { motion } from 'framer-motion'
import { SENSO_COR, SENSO_SIMBOLO } from '../game/sensoInfo'
import type { SensoKey } from '../types'

const SENSOS: SensoKey[] = ['SEIRI', 'SEITON', 'SEISO', 'SEIKETSU', 'SHITSUKE']

// Blobs de lava: posição-base (%), tamanho (px) e a cor do senso.
const BLOBS: { senso: SensoKey; x: string; y: string; size: number; dur: number }[] = [
  { senso: 'SEIRI',    x: '12%', y: '70%', size: 420, dur: 22 },
  { senso: 'SEITON',   x: '78%', y: '24%', size: 460, dur: 26 },
  { senso: 'SEISO',    x: '60%', y: '78%', size: 380, dur: 19 },
  { senso: 'SEIKETSU', x: '28%', y: '20%', size: 400, dur: 24 },
  { senso: 'SHITSUKE', x: '88%', y: '64%', size: 340, dur: 21 },
]

// Símbolos que sobem ao fundo, como bolhas de lava. Valores fixos (sem random)
// para serem estáveis entre renders.
const SIMBOLOS: { senso: SensoKey; left: string; size: number; dur: number; delay: number }[] = [
  { senso: 'SEIRI',    left: '8%',  size: 40, dur: 16, delay: 0 },
  { senso: 'SEITON',   left: '22%', size: 28, dur: 20, delay: 4 },
  { senso: 'SEISO',    left: '37%', size: 52, dur: 14, delay: 8 },
  { senso: 'SEIKETSU', left: '52%', size: 32, dur: 22, delay: 2 },
  { senso: 'SHITSUKE', left: '66%', size: 44, dur: 18, delay: 6 },
  { senso: 'SEITON',   left: '80%', size: 30, dur: 24, delay: 10 },
  { senso: 'SEISO',    left: '92%', size: 38, dur: 17, delay: 3 },
  { senso: 'SEIRI',    left: '46%', size: 26, dur: 21, delay: 12 },
]

export function StartBackground(): JSX.Element {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Base em gradiente azul da marca */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(120% 100% at 50% 0%, #0e2a52 0%, #07162c 70%, #050e1d 100%)' }}
      />

      {/* Blobs de lava desfocados */}
      {BLOBS.map((b, i) => (
        <motion.div
          key={`blob-${i}`}
          className="absolute rounded-full blur-3xl"
          style={{
            left: b.x,
            top: b.y,
            width: b.size,
            height: b.size,
            marginLeft: -b.size / 2,
            marginTop: -b.size / 2,
            background: SENSO_COR[b.senso],
            opacity: 0.22,
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -40, 20, 0],
            scale: [1, 1.12, 0.95, 1],
          }}
          transition={{ duration: b.dur, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Símbolos dos sensos subindo */}
      {SIMBOLOS.map((s, i) => (
        <motion.span
          key={`sym-${i}`}
          className="absolute bottom-0 font-black"
          style={{ left: s.left, fontSize: s.size, color: SENSO_COR[s.senso], opacity: 0.18 }}
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: -900, opacity: [0, 0.22, 0.22, 0], rotate: [0, 12, -8, 0] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: 'linear' }}
        >
          {SENSO_SIMBOLO[s.senso]}
        </motion.span>
      ))}

      {/* Véu para garantir contraste do texto */}
      <div className="absolute inset-0 bg-marca-azul/20" />

      {/* Trilha de pontos dos 5 sensos no rodapé */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
        {SENSOS.map((k) => (
          <motion.span
            key={k}
            className="h-2 w-2 rounded-full"
            style={{ background: SENSO_COR[k] }}
            animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.3, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </div>
  )
}
