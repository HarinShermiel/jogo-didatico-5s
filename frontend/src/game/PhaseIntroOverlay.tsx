// Overlay de introdução de fase — modal grande com explicação completa do senso.
import { motion } from 'framer-motion'
import type { MentorMood } from '../types'
import { MENTOR_POSE, SENSO_COR, SENSO_NOME, SENSO_SIMBOLO, sensoFromPhase } from './sensoInfo'

interface RegraItem {
  icon: string
  titulo: string
  texto: string
  cor?: string
}

interface IntroData {
  pose: MentorMood
  definicao: string
  porque: string
  regras: RegraItem[]
  instrucao: string
}

const INTROS: Partial<Record<number, IntroData>> = {
  1: {
    pose: 'pergunta',
    definicao:
      'Seiri significa separar o necessário do desnecessário. Tudo que não tem uso claro no posto ocupa espaço, atrapalha o fluxo e esconde problemas.',
    porque:
      'Um posto enxuto é mais seguro, mais rápido e mais fácil de manter organizado. Eliminar o supérfluo é o primeiro passo de qualquer melhoria.',
    regras: [
      {
        icon: '✅',
        titulo: 'MANTER',
        texto: 'Uso frequente e necessário no dia a dia do posto.',
        cor: '#3FA34D',
      },
      {
        icon: '🏷️',
        titulo: 'ETIQUETA VERMELHA',
        texto: 'Uso raro, duvidoso ou pertencente a outro setor — aguarda avaliação antes de descartar.',
        cor: '#e05a00',
      },
      {
        icon: '🗑️',
        titulo: 'DESCARTAR',
        texto: 'Danificado, vencido ou sem nenhuma serventia — sai imediatamente.',
        cor: '#E4572E',
      },
    ],
    instrucao: 'Arraste cada item da bancada para a caixa correta.',
  },
  2: {
    pose: 'pergunta',
    definicao:
      'Seiton significa um lugar para cada coisa e cada coisa no seu lugar. Depois do Seiri, o que sobrou precisa ser organizado de forma que qualquer pessoa encontre, use e devolva sem esforço.',
    porque:
      'Ferramentas mal posicionadas geram buscas, atrasos e riscos. Quando tudo tem um lugar fixo e sinalizado, o posto fica mais rápido e mais seguro.',
    regras: [
      {
        icon: '🎯',
        titulo: 'Frequência de uso',
        texto: 'Quanto mais usado, mais próximo e acessível deve estar.',
        cor: '#1565C0',
      },
      {
        icon: '🗄️',
        titulo: 'Shadow board',
        texto: 'Cada ferramenta tem um contorno marcado — devolva sempre ao mesmo lugar.',
        cor: '#1565C0',
      },
      {
        icon: '🔍',
        titulo: 'Identificação visual',
        texto: 'Etiquetas e cores tornam o desvio visível à distância, sem precisar procurar.',
        cor: '#1565C0',
      },
    ],
    instrucao: 'A prateleira mostra os slots. Ache o item pedido na esteira e arraste até o slot piscando.',
  },
  3: {
    pose: 'aprova',
    definicao:
      'Seiso vai além de varrer o chão. Limpar é inspecionar: ao limpar você toca, examina e descobre anomalias que passariam despercebidas.',
    porque:
      'Sujeira esconde defeitos, vazamentos e desgastes. Uma área limpa revela problemas cedo — antes de virar falha ou acidente.',
    regras: [
      {
        icon: '🧹',
        titulo: 'Limpar é inspecionar',
        texto: 'Durante a limpeza, observe sinais de desgaste, vazamento ou dano.',
        cor: '#00695C',
      },
      {
        icon: '⚠️',
        titulo: 'Anomalia real',
        texto: 'Registre apenas o que indica problema — não toda sujeira é anomalia.',
        cor: '#00695C',
      },
      {
        icon: '📋',
        titulo: 'Registro',
        texto: 'Achados devem ser documentados para ação corretiva posterior.',
        cor: '#00695C',
      },
    ],
    instrucao: 'Clique em cada área suja para limpar e decida: é anomalia real ou só sujeira comum?',
  },
  4: {
    pose: 'pergunta',
    definicao:
      'Seiketsu é criar padrões que tornem o resultado dos três primeiros sensos sustentável e visível para todos — não apenas para quem organizou.',
    porque:
      'Sem padrão, o ambiente volta ao caos em dias. Com padrão visual, qualquer pessoa detecta desvios de longe, sem precisar conhecer o processo.',
    regras: [
      {
        icon: '📸',
        titulo: 'Foto de referência',
        texto: 'O padrão começa com um registro do estado correto — a "foto de como deve ser".',
        cor: '#6A1B9A',
      },
      {
        icon: '🟩',
        titulo: 'Gestão à vista',
        texto: 'Marcações no piso, etiquetas, cores — o desvio fica óbvio sem análise.',
        cor: '#6A1B9A',
      },
      {
        icon: '🔄',
        titulo: 'Compare sempre',
        texto: 'Conforme = está como o padrão. Desvio = mudou de posição ou estado.',
        cor: '#6A1B9A',
      },
    ],
    instrucao: 'Fotografe o padrão, depois compare cada item com a referência e classifique.',
  },
  5: {
    pose: 'comemora',
    definicao:
      'Shitsuke é a disciplina de manter o que foi conquistado — transformando os quatro sensos anteriores em hábito, não em evento.',
    porque:
      'Sem disciplina, o 5S dura uma semana. Com disciplina, ele vira cultura: o padrão se mantém sozinho porque a equipe entende o porquê.',
    regras: [
      {
        icon: '🔁',
        titulo: 'Auditoria contínua',
        texto: 'Verifique cada senso regularmente — o radar decai com o tempo.',
        cor: '#B71C1C',
      },
      {
        icon: '⚡',
        titulo: 'Choques de entropia',
        texto: 'A cada 5 segundos um setor cai 20% — reaja rápido para não perder o controle.',
        cor: '#B71C1C',
      },
      {
        icon: '🏆',
        titulo: 'Meta',
        texto: 'Mantenha média ≥ 50% por 30 segundos contínuos para concluir a jornada.',
        cor: '#B71C1C',
      },
    ],
    instrucao: 'Audite os sensos continuamente e sustente o padrão contra a entropia.',
  },
}

interface Props {
  phase: number
  onDone: () => void
}

export function PhaseIntroOverlay({ phase, onDone }: Props): JSX.Element {
  const data = INTROS[phase]
  if (!data) return <></>

  const senso   = sensoFromPhase(phase)
  const cor     = SENSO_COR[senso]
  const simbolo = SENSO_SIMBOLO[senso]
  const nome    = SENSO_NOME[senso]

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <motion.div
        className="relative flex w-full max-w-3xl overflow-hidden rounded-3xl shadow-2xl"
        style={{ background: 'rgba(10,18,35,0.97)', border: `2px solid ${cor}55`, minHeight: 480 }}
        initial={{ y: 32, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 16, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.05 }}
      >
        {/* ── Coluna esquerda — Aroldo ── */}
        <div
          className="relative flex w-52 shrink-0 flex-col items-center justify-center overflow-hidden"
          style={{ background: `linear-gradient(180deg, ${cor}22 0%, ${cor}44 100%)`, borderRight: `1px solid ${cor}33` }}
        >
          {/* Badge fase */}
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold text-white whitespace-nowrap z-10"
            style={{ background: cor }}
          >
            {simbolo} Fase {phase}/5
          </div>

          {/* Aroldo grande */}
          <motion.img
            src={MENTOR_POSE[data.pose]}
            alt="Mestre 5S"
            className="w-full object-contain drop-shadow-2xl"
            style={{ objectPosition: 'center bottom' }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 240, damping: 20, delay: 0.15 }}
          />
        </div>

        {/* ── Coluna direita — conteúdo ── */}
        <div className="flex flex-1 flex-col px-7 py-6 space-y-4 overflow-y-auto">

          {/* Título */}
          <div>
            <h2 className="text-2xl font-black text-white">{nome}</h2>
            <p className="mt-0.5 text-sm font-semibold" style={{ color: `${cor}cc` }}>
              Senso de {nome.split('·')[1]?.trim() ?? nome}
            </p>
          </div>

          {/* Definição */}
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/40">O que é</p>
            <p className="text-sm leading-relaxed text-white/85">{data.definicao}</p>
          </div>

          {/* Por que importa */}
          <div
            className="rounded-xl px-4 py-3"
            style={{ background: `${cor}18`, border: `1px solid ${cor}33` }}
          >
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: cor }}>Por que isso importa</p>
            <p className="text-sm leading-relaxed text-white/80">{data.porque}</p>
          </div>

          {/* Regras */}
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/40">Como funciona</p>
            <div className="space-y-2">
              {data.regras.map((r) => (
                <div
                  key={r.titulo}
                  className="flex items-start gap-3 rounded-xl px-4 py-2.5"
                  style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${r.cor ?? cor}33` }}
                >
                  <span className="mt-0.5 text-xl">{r.icon}</span>
                  <div>
                    <p className="text-xs font-extrabold" style={{ color: r.cor ?? cor }}>{r.titulo}</p>
                    <p className="text-xs leading-snug text-white/70">{r.texto}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instrução + botão */}
          <div className="flex items-center justify-between gap-4 pt-1 mt-auto">
            <div
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white/90"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <span className="text-lg">🎮</span>
              <span>{data.instrucao}</span>
            </div>

            <motion.button
              className="shrink-0 rounded-xl px-6 py-3 font-extrabold text-white shadow-lg"
              style={{ background: cor }}
              whileHover={{ scale: 1.05, filter: 'brightness(1.12)' }}
              whileTap={{ scale: 0.97 }}
              onClick={onDone}
            >
              Vamos lá! ▶
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
