// Mapa emoji → imagem (PNG em /public/itens). Quando não há arte para o emoji,
// o componente cai no próprio emoji renderizado grande.
export const ITEM_IMG: Record<string, string> = {
  '🪛': '/itens/chave-fenda.png',
  '📏': '/itens/paquimetro.png',
  '🧤': '/itens/luva-epi.png',
  '📘': '/itens/manual.png',
  '🔧': '/itens/torquimetro.png',
  '🧱': '/itens/molde-descontinuado.png',
  '⚙️': '/itens/engrenagem-boa.png',
  '🗑️': '/itens/engrenagem-quebrada.png',
  '🦺': '/itens/colete-vencido.png',
  '📦': '/itens/caixa-amassada.png',
  '🧽': '/itens/estopa-oleo.png',
  '🔨': '/itens/dois-martelos.png',
}

export function itemImg(emoji: string): string | undefined {
  return ITEM_IMG[emoji]
}
