// Metadados visuais dos sensos no cliente (cor, símbolo de acessibilidade).
import type { MentorMood, SensoKey } from '../types'

export const SENSO_COR: Record<SensoKey, string> = {
  SEIRI: '#E4572E',
  SEITON: '#2E86AB',
  SEISO: '#3FA34D',
  SEIKETSU: '#6A4C93',
  SHITSUKE: '#C9A227',
}

// Símbolo redundante à cor (modo daltônico não depende só de cor).
export const SENSO_SIMBOLO: Record<SensoKey, string> = {
  SEIRI: '◆',
  SEITON: '■',
  SEISO: '●',
  SEIKETSU: '▲',
  SHITSUKE: '★',
}

export const SENSO_NOME: Record<SensoKey, string> = {
  SEIRI: 'Seiri · Utilização',
  SEITON: 'Seiton · Ordenação',
  SEISO: 'Seiso · Limpeza',
  SEIKETSU: 'Seiketsu · Padronização',
  SHITSUKE: 'Shitsuke · Disciplina',
}

export const MENTOR_POSE: Record<MentorMood, string> = {
  pergunta: '/mentor/mentor-pergunta.png',
  boasvindas: '/mentor/mentor-boasvindas.png',
  comemora: '/mentor/mentor-comemora.png',
  aprova: '/mentor/mentor-aprova.png',
}

// Correção de inclinação (graus) por pose: algumas artes foram desenhadas
// tortas. Contra-rotaciona só onde necessário para o rosto ficar reto.
export const MENTOR_TILT: Record<MentorMood, number> = {
  pergunta: 0,
  boasvindas: 0,
  comemora: 6,
  aprova: 0,
}

export function sensoFromPhase(phase: number): SensoKey {
  const ordem: SensoKey[] = ['SEIRI', 'SEITON', 'SEISO', 'SEIKETSU', 'SHITSUKE']
  return ordem[phase - 1] ?? 'SEIRI'
}
