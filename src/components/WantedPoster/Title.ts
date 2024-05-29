import Text from './Text'
import { Position } from './types'

class Title extends Text {
  #fontSizeScale = 1.6

  setPosition(position: Position) {
    this.x = position.x
    this.y = position.y
    this.width = position.width
    this.height = position.height
    this.fontSize = this.height * this.#fontSizeScale
  }

  beforeRenderText() {
    this.ctx.font = `700 ${this.fontSize}px 'Scheherazade New', serif`
    const actualHeight = this.getTextActualHeight(this.formattedText)
    const scale = this.height / actualHeight
    const offsetY = (actualHeight - this.height) / 2
    this.ctx.font = `700 ${Math.floor(
      this.fontSize * scale
    )}px 'Scheherazade New', serif`

    this.ctx.letterSpacing = "4px"

    const x = this.x + this.width / 2
    const y = this.y + offsetY

    return { x, y, maxWidth: this.width }
  }
}

export default Title
