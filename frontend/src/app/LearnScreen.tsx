// Tela "Aprenda mais" — conteúdo detalhado do 5S + vídeo embutido.
import { motion } from 'framer-motion'

const SENSOS = [
  {
    id: 1,
    nome: 'Seiri',
    pt: 'Utilização',
    emoji: '🗂️',
    cor: '#E4572E',
    resumo: 'Separar o necessário do desnecessário.',
    descricao:
      'O Seiri é o primeiro e mais fundamental dos sensos. Consiste em identificar tudo que existe no ambiente de trabalho e separar o que é realmente necessário do que não é. Itens desnecessários consomem espaço, causam confusão e escondem problemas.',
    como: [
      'Liste todos os itens presentes no ambiente.',
      'Pergunte: "Este item é necessário para o trabalho atual?"',
      'Itens de uso frequente → mantém no posto.',
      'Itens de uso raro ou duvidoso → Etiqueta Vermelha (avaliação).',
      'Itens danificados, vencidos ou sem uso → descarte imediato.',
    ],
    exemplo:
      'Uma bancada com 40 ferramentas onde só 12 são usadas diariamente. As outras 28 são candidatas ao Seiri: identificar e retirar.',
  },
  {
    id: 2,
    nome: 'Seiton',
    pt: 'Ordenação',
    emoji: '📦',
    cor: '#F4A261',
    resumo: 'Um lugar para cada coisa, cada coisa no seu lugar.',
    descricao:
      'Após eliminar o desnecessário, o Seiton define um local específico para cada item que permaneceu. O objetivo é que qualquer pessoa encontre qualquer coisa em menos de 30 segundos, sem precisar perguntar.',
    como: [
      'Defina um local fixo para cada item com base na frequência de uso.',
      'Use identificação visual: etiquetas, contornos, cores, sombras.',
      'Itens de uso diário → mais próximos do operador.',
      'Itens de uso semanal → acessíveis, mas não no caminho.',
      'Padronize a identificação para que qualquer pessoa entenda.',
    ],
    exemplo:
      'Um painel de ferramentas com o contorno de cada peça pintado. Se algo está fora do lugar, qualquer um percebe em segundos.',
  },
  {
    id: 3,
    nome: 'Seiso',
    pt: 'Limpeza',
    emoji: '🧹',
    cor: '#2EC4B6',
    resumo: 'Limpar é também inspecionar.',
    descricao:
      'Seiso vai além de varrer o chão. É o ato de limpar e, ao limpar, inspecionar. Cada mancha de óleo, cada parafuso solto, cada anomalia detectada durante a limpeza é uma oportunidade de prevenir uma falha futura.',
    como: [
      'Estabeleça uma rotina de limpeza (diária, semanal).',
      'Ao limpar, inspecione: busque anomalias, vazamentos, sujeiras incomuns.',
      'Registre problemas encontrados — não apenas limpe por cima.',
      'Identifique a fonte da sujeira e elimine a causa raiz.',
      'Defina responsáveis por área.',
    ],
    exemplo:
      'Operador limpa a base do motor e percebe um vazamento de óleo. Em vez de só limpar, registra a anomalia. Manutenção age antes de uma parada.',
  },
  {
    id: 4,
    nome: 'Seiketsu',
    pt: 'Padronização',
    emoji: '📋',
    cor: '#8338EC',
    resumo: 'Manter e tornar visível o padrão.',
    descricao:
      'Seiketsu garante que os ganhos dos três primeiros sensos não se percam. Significa criar padrões visuais claros — fotos do "como deve ser", checklists simples, sinalizações — para que qualquer pessoa saiba o que é correto sem precisar perguntar.',
    como: [
      'Fotografe o estado ideal após aplicar Seiri, Seiton e Seiso.',
      'Crie quadros visuais comparando "correto" vs "incorreto".',
      'Padronize identificações: mesmo formato, mesmas cores, mesma linguagem.',
      'Estabeleça rotinas de auditoria para verificar conformidade.',
      'Torne os desvios visíveis — anomalia que não se vê não é corrigida.',
    ],
    exemplo:
      'Um quadro com a foto do painel de ferramentas no estado correto exposto na parede. Se uma ferramenta estiver fora do lugar, a comparação visual mostra imediatamente.',
  },
  {
    id: 5,
    nome: 'Shitsuke',
    pt: 'Disciplina',
    emoji: '🏅',
    cor: '#3FA34D',
    resumo: 'Transformar em hábito, auditar e sustentar.',
    descricao:
      'Shitsuke é o senso mais difícil e mais importante. Sem disciplina, o 5S dura semanas. Com disciplina, ele vira cultura. Significa cumprir os padrões estabelecidos mesmo sem supervisão — por entender o porquê, não por obrigação.',
    como: [
      'Realize auditorias regulares (semanal ou quinzenal).',
      'Envolva toda a equipe — não é só papel da liderança.',
      'Divulgue os resultados das auditorias abertamente.',
      'Celebre os avanços, corrija os desvios sem punição.',
      'Eduque continuamente sobre o porquê do 5S, não só o como.',
    ],
    exemplo:
      'Uma equipe que mantém o padrão mesmo quando o supervisor não está presente — porque entende que organização protege todos, não porque está sendo vigiada.',
  },
]

interface Props {
  onVoltar: () => void
}

export function LearnScreen({ onVoltar }: Props): JSX.Element {
  return (
    <div className="h-full overflow-y-auto bg-[#0d1321] text-white">
      {/* Header fixo */}
      <div className="sticky top-0 z-20 flex items-center justify-between bg-[#0d1321]/90 px-6 py-4 backdrop-blur border-b border-white/10">
        <button
          onClick={onVoltar}
          className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20 transition"
        >
          ← Voltar
        </button>
        <h1 className="text-lg font-black">
          eKaizen <span className="text-marca-laranja">5S</span> — Aprenda mais
        </h1>
        <div className="w-20" />
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 space-y-10">

        {/* O que é o 5S */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-white/5 p-6 text-center border border-white/10"
        >
          <p className="text-2xl font-black mb-2">O que é o <span className="text-marca-laranja">5S</span>?</p>
          <p className="text-white/70 text-sm leading-relaxed">
            O 5S é uma metodologia de organização de origem japonesa desenvolvida na Toyota.
            Seu nome vem de cinco palavras japonesas que descrevem práticas para criar e manter
            um ambiente de trabalho organizado, limpo, seguro e eficiente.
            Quando aplicado de forma consistente, elimina desperdícios, reduz acidentes,
            melhora a qualidade e aumenta a produtividade — sem grandes investimentos.
          </p>
        </motion.div>

        {/* Vídeo */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <h2 className="text-lg font-black text-white/90">🎬 Assista e entenda</h2>
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10" style={{ aspectRatio: '16/9' }}>
            <iframe
              src="https://www.youtube.com/embed/Wrg40-OM_Yw?rel=0&modestbranding=1"
              title="5S — eKaizen"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </motion.div>

        {/* Os 5 sensos — todos já expandidos */}
        <div className="space-y-2">
          <h2 className="text-lg font-black text-white/90">📖 Os 5 Sensos</h2>
        </div>

        {SENSOS.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * i }}
            className="rounded-3xl overflow-hidden border"
            style={{ borderColor: s.cor + '55' }}
          >
            {/* Cabeçalho do senso */}
            <div
              className="flex items-center gap-4 px-5 py-4"
              style={{ background: s.cor + '22' }}
            >
              <span className="text-4xl">{s.emoji}</span>
              <div>
                <p className="font-black text-lg leading-tight" style={{ color: s.cor }}>
                  {s.id}. {s.nome}
                </p>
                <p className="text-sm text-white/60 font-semibold">{s.pt} — {s.resumo}</p>
              </div>
            </div>

            {/* Corpo */}
            <div className="bg-white/5 px-5 py-5 space-y-5">
              <p className="text-sm text-white/75 leading-relaxed">{s.descricao}</p>

              <div>
                <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: s.cor }}>
                  Como aplicar
                </p>
                <ul className="space-y-2">
                  {s.como.map((c, j) => (
                    <li key={j} className="flex gap-3 text-sm text-white/70">
                      <span
                        className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white mt-0.5"
                        style={{ background: s.cor }}
                      >
                        {j + 1}
                      </span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl p-4" style={{ background: s.cor + '18', border: `1px solid ${s.cor}33` }}>
                <p className="text-xs font-black uppercase tracking-wider mb-1" style={{ color: s.cor }}>
                  💡 Exemplo prático
                </p>
                <p className="text-sm text-white/70 leading-relaxed">{s.exemplo}</p>
              </div>
            </div>
          </motion.div>
        ))}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-3xl bg-marca-laranja/10 border border-marca-laranja/30 p-6 text-center"
        >
          <p className="text-base font-black mb-1">Pronto para praticar?</p>
          <p className="text-sm text-white/60 mb-4">
            Agora que você sabe o que é o 5S, coloque em prática no jogo.
          </p>
          <button
            onClick={onVoltar}
            className="rounded-2xl bg-marca-laranja px-8 py-3 text-sm font-black text-white shadow-xl hover:brightness-110 transition"
          >
            ▶ Começar a jornada
          </button>
        </motion.div>

        <div className="h-8" />
      </div>
    </div>
  )
}
