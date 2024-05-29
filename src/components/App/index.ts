import WantedPoster, { WantedPosterAttribute } from '../WantedPoster'
import templateContent from './template.html?raw'
import store, { addListener } from '../../store'
import type WantedButton from '../WantedButton'
import LaunchHandler from './launch-handler'
import cssContent from './style.css?inline'
import EditPanel from '../EditPanel'

const TAG_NAME = 'app-container'
const template = document.createElement('template')
template.innerHTML = templateContent

class App extends HTMLElement {
  #editPanel: EditPanel
  #wantedPoster: WantedPoster
  #uploadInput: HTMLInputElement
  #editButton: WantedButton
  #importButton: WantedButton
  #exportButton: WantedButton

  #root: ShadowRoot
  #storeListener: Parameters<typeof addListener>[1]
  #startTime: number = 0

  constructor() {
    super()

    const shadowRoot = this.attachShadow({ mode: 'open' })
    this.#root = shadowRoot

    const style = document.createElement('style')
    style.textContent = cssContent

    shadowRoot.append(style, template.content.cloneNode(true))
    shadowRoot.addEventListener('WantedPosterLoaded', () => {
      this.#removeLoading()
    })

    const posterSlot =
      this.#root.querySelector<HTMLSlotElement>('slot[name=poster]')
    this.#wantedPoster = posterSlot?.assignedNodes()[0] as WantedPoster

    this.#editPanel = this.#root.querySelector<EditPanel>('edit-panel')!

    this.#uploadInput =
      this.#root.querySelector<HTMLInputElement>('#uploadInput')!
    this.#editButton = this.#root.querySelector<WantedButton>('#editButton')!
    this.#importButton =
      this.#root.querySelector<WantedButton>('#importButton')!
    this.#exportButton =
      this.#root.querySelector<WantedButton>('#exportButton')!

    this.#storeListener = (key, value) => {
      switch (key) {
        case 'photoUrl':
          this.#setWantedPosterAttributes({ 'photo-url': value.toString() })
          break
        case 'conditionSelect':
          this.#setWantedPosterAttributes({
            'dead-or-alive': value.toString()
          })
          break
        case 'name':
        case 'bounty':
        case 'description1':
        case 'description2':
        case 'description3':
          this.#setWantedPosterAttributes({ [key]: value.toString() })
      }
    }
  }

  #removeLoading() {
    const loadingOverlay =
      this.#root.querySelector<HTMLElement>('.loading-overlay')!

    const minLoadingTime = 1000
    const intervalId = setInterval(() => {
      const time = new Date().getTime()
      if (time - this.#startTime < minLoadingTime) {
        return
      }

      clearTimeout(intervalId)
      loadingOverlay.style.transition = 'opacity 1s'
      loadingOverlay.style.opacity = '0'

      setTimeout(() => loadingOverlay.remove(), 1000)
    }, 200)
  }

  #setWantedPosterAttributes(attributes: WantedPosterAttribute) {
    const keys = Object.keys(attributes) as Array<keyof WantedPosterAttribute>    
    for (const key of keys) {
      const value = attributes[key] ?? ''
      this.#wantedPoster.setAttribute(key, value)
    }
  }

  connectedCallback() {
    this.#setWantedPosterAttributes({
      'title': 'PROCURADO',
      'name': store.name,
      'bounty': store.bounty,
      'guild-name': 'SOUL SOCIETY',
      'dead-or-alive': store.conditionSelect,
      'description1': store.description1,
      'description2': store.description2,
      'description3': store.description3
    })

    addListener('photoUrl', this.#storeListener)
    addListener('name', this.#storeListener)
    addListener('bounty', this.#storeListener)
    addListener('conditionSelect', this.#storeListener)
    addListener('description1', this.#storeListener)
    addListener('description2', this.#storeListener)
    addListener('description3', this.#storeListener)

    this.addEventListener('dragover', (event) => {
      event.preventDefault()
    })

    this.addEventListener('dragenter', () => {
      this.classList.add('dragin')
    })

    this.addEventListener('dragleave', (e) => {
      if (e.relatedTarget === null) {
        this.classList.remove('dragin')
      }
    })

    this.addEventListener('drop', (event) => {
      event.preventDefault()
      this.classList.remove('dragin')

      const file = event.dataTransfer?.files[0]
      if (!file || !file.type.startsWith('image')) {
        return
      }

      const objUrl = URL.createObjectURL(file)
      store.photoUrl = objUrl
    })

    this.#uploadInput.addEventListener('input', () => {
      const file = this.#uploadInput.files ? this.#uploadInput.files[0] : null
      if (!file || !file.type.startsWith('image')) {
        return
      }

      const objUrl = URL.createObjectURL(file)
      store.photoUrl = objUrl
    })

    this.#editButton.addEventListener('click', () => {
      this.#editPanel.toggle()
    })

    this.#importButton.addEventListener('click', () => {
      this.#uploadInput.value = ''
      this.#uploadInput.click()
    })

    this.#exportButton.addEventListener('click', async () => {
      if (this.#exportButton.loading) {
        return
      }

      this.#exportButton.loading = true
      try {
        await this.#wantedPoster.export()
      } catch (e) {
        console.error(e)
        let message = ''
        if (e instanceof Error) {
          message = e.message
        }
        alert(`Oops! something went wrong. 😢 \n ${message}`)
      } finally {
        this.#exportButton.loading = false
      }
    })

    LaunchHandler.setConsumer(async (handles) => {
      const handle = handles[0]
      if (!LaunchHandler.isFileHandle(handle)) {
        return
      }
      const blob = await handle.getFile()
      const objUrl = URL.createObjectURL(blob)
      store.photoUrl = objUrl
    })
  }
}

customElements.define(TAG_NAME, App)

export default App
