// Onboarding guiado pelo Mentor — explica o objetivo em segundos. Desativável.
import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { Button } from '../ui/Button'

export function Onboarding(): JSX.Element {
  const dismiss = useGameStore((s) => s.dismissOnboarding)
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label="Como jogar"
    >
      <motion.div
        className="w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl"
        initial={{ scale: 0.88, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      >
        {/* Topo escuro = fundo azul do PNG se mistura e some */}
        <div
          className="flex justify-center pb-4 pt-8"
          style={{ background: 'linear-gradient(160deg, #0e3460 0%, #123A66 100%)' }}
        >
          <motion.img
            src="/mentor/mentor-boasvindas.png"
            alt="Aroldo, o Mestre 5S"
            className="h-48 w-auto object-contain drop-shadow-2xl"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Conteúdo branco */}
        <div className="bg-white px-6 pb-6 pt-4 text-marca-azul">
          <h2 className="mb-3 text-center text-xl font-extrabold">Como jogar</h2>
          <ul className="space-y-2 text-sm">
            <li>🎯 Aplique os <b>5 sensos na ordem</b> — cada fase tem uma ação diferente.</li>
            <li>🖐️ <b>Arraste, encaixe, limpe e audite</b>. Aprende-se fazendo, não decorando.</li>
            <li>📡 O <b>Radar 5S</b> mostra seu progresso ao vivo; o Mestre te guia o tempo todo.</li>
            <li>⚡ De vez em quando vem o <b>Desafio do Mestre</b> — classifique a situação pelo senso certo.</li>
          </ul>
          <div className="mt-5 flex justify-center">
            <Button onClick={dismiss} aria-label="Entendi, começar a jogar">
              Bora! 🚀
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
