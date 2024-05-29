import Text from './Text'
import { BountyInfo } from './types'
import { loadImage } from './utils'

class Bounty extends Text {
  #isNumber = true
  #numberFormat = new Intl.NumberFormat()
  #bellySignImage: HTMLImageElement | null = null
  #bellyImageScale = 1
  #bellyMarginRight = 0
  fontScale = 1
  verticalOffset = 0

  async loadBellyImage(url: string) {
    try {
      this.#bellySignImage = await loadImage(url)
    } catch (error) {
      console.error(error)
      throw new Error('Failed to init bounty.')
    }
  }

  setBountyInfo(bountyInfo: BountyInfo, bellyImageScale: number) {
    const { x, y, width, height, bellyMarginRight, fontSize } = bountyInfo
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.fontSize = fontSize
    this.#bellyMarginRight = bellyMarginRight
    this.#bellyImageScale = bellyImageScale
  }

  formatText(text: string, spacing: number = 0): string {
    const price = Number.parseFloat(text)
    if (Number.isNaN(price)) {
      this.#isNumber = false
      return this.formatSpacing(text, spacing)
    }

    this.#isNumber = true
    const formattedPrice = this.#numberFormat.format(price)
    return this.formatSpacing(formattedPrice, spacing)
  }

  beforeRenderText() {
    if (!this.#bellySignImage || !this.#isNumber) {
      return
    }

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
    
    const scaledBellySignWidth =
      this.#bellySignImage.width * this.#bellyImageScale
    const scaledBellySignHeight =
      this.#bellySignImage.height * this.#bellyImageScale

    const centerX = this.x + this.width / 2
    const bellySignAreaWidth = this.#isNumber
    ? scaledBellySignWidth + this.#bellyMarginRight
    : 0
    const maxWidth = this.width - bellySignAreaWidth
    const textWidth = Math.min(
      this.ctx.measureText(this.formattedText).width,
      maxWidth
    )

    const bellySignX = centerX - bellySignAreaWidth / 2 - textWidth / 2 - 25
    const bellySignY = this.y - 10

    this.ctx.drawImage(
      this.#bellySignImage,
      bellySignX,
      bellySignY,
      scaledBellySignWidth,
      scaledBellySignHeight
    )

    return { x, y, maxWidth: this.width }
  }
}

export default Bounty
