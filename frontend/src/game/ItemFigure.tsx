// Renderiza a arte real do item (PNG em /public/itens) quando existe; senão,
// cai no emoji grande. Compartilhado entre as fases para um visual consistente.
import { itemImg } from './itemImg'

interface Props {
  emoji: string
  size: number
  grayscale?: boolean
}

export function ItemFigure({ emoji, size, grayscale = false }: Props): JSX.Element {
  const img = itemImg(emoji)
  if (img !== undefined) {
    return (
      <img
        src={img}
        alt=""
        draggable={false}
        className={`object-contain drop-shadow-md ${grayscale ? 'grayscale' : ''}`}
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <span className="drop-shadow-md" style={{ fontSize: size * 0.8, lineHeight: 1 }} aria-hidden="true">
      {emoji}
    </span>
  )
}
