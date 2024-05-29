import { ONE_PIECE_WANTED_IMAGE } from './constants'
import cssContent from './style.css?inline'
import { getFitScale } from './utils'

import type { PosterCanvasElement, PosterRenderingContext2D } from './types'

import Bounty from './Bounty'
import Name from './Name'
import Photo from './Photo'
import PhotoResizer from './PhotoResizer'
import WantedImage from './WantedImage'
import GuildName from './GuildName'
import deadOrAlive from './DeadOrAlive'
import Description from './Description'
import Title from './Title'
import DeadOrAlive from './DeadOrAlive'

const TAG_NAME = 'wanted-poster'
const ATTRIBUTES = [
  'name',
  'bounty',
  'photo-url',
  'filter',
  'poster-shadow',
  'photo-shadow',
  'guild-name',
  'dead-or-alive',
  'description1',
  'description2',
  'description3',
  'title'
] as const

type Attributes = typeof ATTRIBUTES
export type WantedPosterAttribute = {
  [key in Attributes[number]]?: string
}

class WantedPoster extends HTMLElement {
  #container: HTMLDivElement
  #canvas: PosterCanvasElement
  #ctx: PosterRenderingContext2D

  #photo: Photo
  #photoResizer: PhotoResizer
  #name: Name
  #bounty: Bounty
  #wantedImage: WantedImage
  #status: 'init' | 'loading' | 'success' | 'error'
  #guildName: GuildName
  #title: Title
  #deadOrAlive: deadOrAlive
  #description1: Description
  #description2: Description
  #description3: Description

  #resizeObserver: ResizeObserver
  #resizeTimeout?: number

  constructor() {
    super()
    this.#status = 'init'

    const shadowRoot = this.attachShadow({ mode: 'open' })

    const canvas = document.createElement('canvas') as PosterCanvasElement
    canvas.domWidth = 0
    canvas.domHeight = 0
    const container = document.createElement('div')
    container.className = 'container'

    const style = document.createElement('style')
    style.textContent = cssContent

    shadowRoot.append(style, container)

    const ctx = canvas.getContext('2d') as PosterRenderingContext2D

    this.#container = container
    this.#canvas = canvas
    this.#ctx = ctx

    this.#wantedImage = new WantedImage(ctx, ONE_PIECE_WANTED_IMAGE)
    this.#photo = new Photo(ctx)
    this.#name = new Name(ctx)
    this.#bounty = new Bounty(ctx)
    this.#photoResizer = new PhotoResizer(ctx, this.#photo)
    this.#guildName = new GuildName(ctx)
    this.#deadOrAlive = new deadOrAlive(ctx)
    this.#description1 = new Description(ctx)
    this.#description2 = new Description(ctx)
    this.#description3 = new Description(ctx)
    this.#title = new Title(ctx)

    this.#resizeObserver = new ResizeObserver(() => {
      clearTimeout(this.#resizeTimeout)
      this.#resizeTimeout = window.setTimeout(() => this.#resize(), 200)
    })
    this.#resizeObserver.observe(container)
  }

  static get observedAttributes(): Attributes {
    return ATTRIBUTES
  }

  async connectedCallback() {
    console.log('[connected]')

    await new Promise((resolve) => {
      setTimeout(() => {
        document.getElementsByTagName("body")[0].style.display = "none"
        resolve('')
      });

      setTimeout(() => {
        document.getElementsByTagName("body")[0].style.display = "block"
      }, 100);
    })

    this.#status = 'loading'

    const posterShadow = this.#getAttrNumberValue('poster-shadow')
    const rect = this.#container.getBoundingClientRect()

    try {
      await this.#wantedImage.loadImage()

      const wantedImageInfo = this.#wantedImage.setSize({
        width: rect.width,
        height: rect.height,
        shadowSize: posterShadow,
        quality: 'half'
      })

      this.#name.setPosition(wantedImageInfo.namePosition)
      this.#bounty.setBountyInfo(
        wantedImageInfo.bountyInfo,
        this.#wantedImage.imageScale
      )

      await this.#bounty.loadBellyImage(ONE_PIECE_WANTED_IMAGE.bellyImageUrl)
      await this.#photo.init(
        wantedImageInfo.photoPosition,
        wantedImageInfo.boundaryOffset
      )
      await this.#photo.loadImage(this.getAttribute('photo-url'))
    } catch (e) {
      this.#status = 'error'
      console.error('Failed to init wanted poster.', e)
      return
    }

    this.#status = 'success'

    this.#render()
    this.#container.appendChild(this.#canvas)
    this.dispatchEvent(new CustomEvent('WantedPosterLoaded', { bubbles: true }))
  }

  disconnectedCallback() {
    console.log('[disconnected]')
    this.#resizeObserver.disconnect()
  }

  adoptedCallback() {
    console.log('[adopted]')
  }

  async attributeChangedCallback(
    attributeName: Attributes[number],
    _: string,
    newValue: string
  ) {
    switch (attributeName) {
      case 'name':
        this.#name.text = newValue
        break

      case 'bounty':
        this.#bounty.text = newValue
        break

      case 'photo-url': {
        await this.#photo.loadImage(newValue)
        this.#photoResizer.highlight = newValue.endsWith('#nohighlight')
          ? false
          : true
        break
      }

      case 'filter': {
        this.#photo.filter = newValue
        break
      }

      case 'guild-name':
        this.#guildName.text = newValue
        break

      case 'dead-or-alive':
        this.#deadOrAlive.text = newValue
        break

      case 'description1':
        this.#description1.text = newValue
        break

      case 'description2':
        this.#description2.text = newValue
        break
      
      case 'description3':
        this.#description3.text = newValue
        break

      case 'title':
        this.#title.text = newValue
        break
    }
  }

  #getAttrNumberValue(
    attr: Attributes[number],
    defaultValue: number = 0
  ): number {
    const value = this.getAttribute(attr) || ''
    return parseFloat(value) || defaultValue
  }

  async export() {
    const canvas = document.createElement('canvas') as PosterCanvasElement
    canvas.domWidth = 0
    canvas.domHeight = 0
    canvas.style.display = 'none'

    const ctx = canvas.getContext('2d') as PosterRenderingContext2D

    const posterShadow = this.#getAttrNumberValue('poster-shadow')
    const wantedImage = new WantedImage(ctx, ONE_PIECE_WANTED_IMAGE)
    const photo = new Photo(ctx)
    const name = new Name(ctx)
    const bounty = new Bounty(ctx)
    const guildName = new GuildName(ctx)
    const deadOrAlive = new DeadOrAlive(ctx)
    const description1 = new Description(ctx)
    const description2 = new Description(ctx)
    const description3 = new Description(ctx)
    const title = new Title(ctx)

    const image = await wantedImage.loadImage()
    const exportWidth = image.width + posterShadow * 2
    const exportHeight = image.height + posterShadow * 2

    const wantedImageInfo = wantedImage.setSize({
      width: exportWidth,
      height: exportHeight,
      shadowSize: posterShadow,
      quality: 'original'
    })

    name.setPosition(wantedImageInfo.namePosition)
    guildName.setPosition(wantedImageInfo.guildNamePosition)
    deadOrAlive.setPosition(wantedImageInfo.deadOrAlivePosition)
    description1.setPosition(wantedImageInfo.descriptionPosition1)
    description2.setPosition(wantedImageInfo.descriptionPosition2)
    description3.setPosition(wantedImageInfo.descriptionPosition3)
    title.setPosition(wantedImageInfo.titlePosition)

    bounty.setBountyInfo(
      wantedImageInfo.bountyInfo,
      this.#wantedImage.imageScale
    )

    await bounty.loadBellyImage(wantedImageInfo.bellyImageUrl)

    name.text = this.getAttribute('name') ?? ''
    bounty.text = this.getAttribute('bounty') ?? ''
    bounty.fontFamily = this.getAttribute('bounty-font-family') ?? ''

    guildName.text = this.getAttribute('guild-name') ?? ''
    deadOrAlive.text = this.getAttribute('dead-or-alive') ?? ''
    description1.text = this.getAttribute('description1') ?? ''
    description2.text = this.getAttribute('description2') ?? ''
    description3.text = this.getAttribute('description3') ?? ''
    title.text = this.getAttribute('title') ?? ''

    await photo.init(
      wantedImageInfo.photoPosition,
      wantedImageInfo.boundaryOffset
    )
    await photo.loadImage(this.getAttribute('photo-url'))

    photo.shadow = this.#getAttrNumberValue('photo-shadow')
    const { x, y, width, height, filter } = this.#photo
    photo.x = x / this.#wantedImage.imageScale
    photo.y = y / this.#wantedImage.imageScale
    photo.width = width / this.#wantedImage.imageScale
    photo.height = height / this.#wantedImage.imageScale
    photo.filter = filter

    bounty.setBountyInfo(ONE_PIECE_WANTED_IMAGE.bountyInfo, 1.2)

    photo.updateRenderPosition()

    photo.render()
    wantedImage.render()
    bounty.render()
    name.render()
    guildName.render()
    deadOrAlive.render()
    description1.render()
    description2.render()
    description3.render()
    title.render()

    let url = ''
    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            blob ? resolve(blob) : reject('Failed to create blob object.')
          },
          'image/png',
          1
        )
      })
      url = URL.createObjectURL(blob)
      this.#downloadFile(url, 'wanted-poster.png')
    } finally {
      if (url) {
        URL.revokeObjectURL(url)
      }
    }
  }

  #downloadFile(uri: string, fileName: string) {
    const anchor = document.createElement('a')
    anchor.setAttribute('href', uri)
    anchor.setAttribute('download', fileName)
    anchor.style.display = 'none'

    document.body.appendChild(anchor)

    anchor.click()
    anchor.remove()
  }

  #resize() {
    if (this.#status !== 'success') {
      return
    }

    const posterShadow = this.#getAttrNumberValue('poster-shadow')
    const containerRect = this.#container.getBoundingClientRect()
    const canvasRect = this.#canvas.getBoundingClientRect()

    const resizeScale = getFitScale(
      containerRect.width,
      containerRect.height,
      canvasRect.width,
      canvasRect.height
    )
    const wantedImageInfo = this.#wantedImage.setSize({
      width: containerRect.width,
      height: containerRect.height,
      shadowSize: posterShadow,
      quality: 'half'
    })

    this.#name.setPosition(wantedImageInfo.namePosition)
    this.#bounty.setBountyInfo(
      wantedImageInfo.bountyInfo,
      1
    )

    this.#photo.setBoundary(
      wantedImageInfo.photoPosition,
      wantedImageInfo.boundaryOffset
    )
    this.#photoResizer.scale(resizeScale)
    this.#photoResizer.borderScale = this.#wantedImage.imageScale

    this.#guildName.setPosition(wantedImageInfo.guildNamePosition)
    this.#deadOrAlive.setPosition(wantedImageInfo.deadOrAlivePosition)
    this.#description1.setPosition(wantedImageInfo.descriptionPosition1)
    this.#description2.setPosition(wantedImageInfo.descriptionPosition2)
    this.#description3.setPosition(wantedImageInfo.descriptionPosition3)
    this.#title.setPosition(wantedImageInfo.titlePosition)
  }

  #render() {
    this.#ctx.clearRect(0, 0, this.#canvas.domWidth, this.#canvas.domHeight)
    this.#photo.render()
    this.#wantedImage.render()
    this.#bounty.render()
    this.#name.render()
    this.#photoResizer.render()
    this.#guildName.render()
    this.#deadOrAlive.render()
    this.#description1.render()
    this.#description2.render()
    this.#description3.render()
    this.#title.render()

    requestAnimationFrame(this.#render.bind(this))
  }
}

customElements.define(TAG_NAME, WantedPoster)

export default WantedPoster
