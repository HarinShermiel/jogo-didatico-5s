"""Quiz Conceitual — 5 perguntas de conhecimento, uma por senso.

REGRA DE OURO: o índice da opção correta (`gabarito`) nunca trafega ao
cliente. O front recebe apenas `senso`, `pergunta` e a lista de textos das
opções; o backend valida a escolha e devolve somente o feedback.
"""

from __future__ import annotations

from dataclasses import dataclass

from .sensos import Senso


@dataclass(frozen=True)
class Opcao:
    texto: str
    pontos: int  # 0, 10, 20 ou 100


@dataclass(frozen=True)
class QuizPergunta:
    senso: Senso
    pergunta: str
    opcoes: tuple[Opcao, ...]  # exatamente 3, índice 0=A 1=B 2=C
    gabarito: int              # índice da opção correta (NUNCA vai ao cliente)


# Perguntas conforme spec do chefe — pontos exatos do documento.
_BANCO: dict[Senso, QuizPergunta] = {
    Senso.SEIRI: QuizPergunta(
        senso=Senso.SEIRI,
        pergunta=(
            "Você encontrou 5 itens na bancada que não são usados há mais de "
            "6 meses, mas 'podem ser úteis um dia'. Qual a ação correta imediata?"
        ),
        opcoes=(
            Opcao("Deixar onde estão, afinal, 'quem guarda, tem'.", 0),
            Opcao("Mudar de lugar para esconder a bagunça do supervisor.", 10),
            Opcao(
                "Aplicar a Etiqueta Vermelha (Red Tag), mover para a área de "
                "descarte/quarentena e avaliar o destino real.",
                100,
            ),
        ),
        gabarito=2,
    ),
    Senso.SEITON: QuizPergunta(
        senso=Senso.SEITON,
        pergunta=(
            "Para garantir ergonomia e rapidez no trabalho diário, como devemos "
            "organizar as ferramentas e materiais de uso constante?"
        ),
        opcoes=(
            Opcao("Guardar no armário central da fábrica para ninguém pegar.", 0),
            Opcao("Dispor por ordem alfabética dentro de uma caixa escura.", 20),
            Opcao(
                "Definir locais demarcados, identificados e por frequência de uso: "
                "o que usa sempre fica ao alcance das mãos; o que usa raramente fica mais afastado.",
                100,
            ),
        ),
        gabarito=2,
    ),
    Senso.SEISO: QuizPergunta(
        senso=Senso.SEISO,
        pergunta=(
            "No conceito do 3º Senso, limpar é importante, mas qual é o objetivo "
            "principal do Seiso?"
        ),
        opcoes=(
            Opcao("Deixar o ambiente brilhando apenas para a auditoria passar.", 10),
            Opcao(
                "Limpar e, fundamentalmente, inspecionar para descobrir as fontes "
                "de sujeira e anomalias (como vazamentos de óleo).",
                100,
            ),
            Opcao(
                "Esperar a equipe de limpeza terceirizada resolver, afinal, o "
                "operador só produz.",
                0,
            ),
        ),
        gabarito=1,
    ),
    Senso.SEIKETSU: QuizPergunta(
        senso=Senso.SEIKETSU,
        pergunta=(
            "Como garantimos que as melhorias dos três primeiros sensos (Seiri, "
            "Seiton, Seiso) sejam mantidas ao longo do tempo?"
        ),
        opcoes=(
            Opcao(
                "Criando padrões visuais claros (fotos do 'antes e depois', "
                "checklist simples) e rotinas diárias de 5 minutos antes do turno.",
                100,
            ),
            Opcao("Dando bronca na equipe toda vez que o setor estiver bagunçado.", 0),
            Opcao(
                "Contratando um fiscal em tempo integral para vigiar cada posto de trabalho.",
                20,
            ),
        ),
        gabarito=0,
    ),
    Senso.SHITSUKE: QuizPergunta(
        senso=Senso.SHITSUKE,
        pergunta="O Shitsuke (Autodisciplina) foi atingido com sucesso quando:",
        opcoes=(
            Opcao(
                "Os operadores cumprem as regras apenas quando o supervisor ou o "
                "auditor estão olhando.",
                10,
            ),
            Opcao(
                "O 5S se torna um hábito natural e cultural, onde todos mantêm os "
                "padrões e buscam melhorias continuamente por iniciativa própria.",
                100,
            ),
            Opcao(
                "O setor ganha nota máxima na auditoria, mesmo que no dia seguinte "
                "tudo volte a ser caótico.",
                0,
            ),
        ),
        gabarito=1,
    ),
}


def pergunta(senso: Senso) -> QuizPergunta:
    """Retorna a pergunta do quiz para o senso indicado."""
    return _BANCO[senso]


def responder(senso: Senso, opcao: int) -> tuple[bool, int]:
    """Valida a escolha (0=A, 1=B, 2=C) e retorna (acertou, pontos).

    Levanta ValueError se `opcao` estiver fora de range.
    NUNCA exponha `gabarito` ao chamador externo — use apenas o booleano.
    """
    q = _BANCO[senso]
    if opcao not in (0, 1, 2):
        raise ValueError(f"opcao deve ser 0, 1 ou 2; recebeu {opcao}")
    acertou = opcao == q.gabarito
    pontos = q.opcoes[opcao].pontos
    return acertou, pontos


def public_quiz(senso: Senso) -> dict[str, object]:
    """Projeção pública da pergunta — SEM o campo gabarito."""
    q = _BANCO[senso]
    return {
        "senso": q.senso.name,
        "pergunta": q.pergunta,
        "opcoes": [{"label": chr(65 + i), "texto": o.texto} for i, o in enumerate(q.opcoes)],
    }
