import store, { addListener, reset } from '../../store'
import ConditionSelect from '../ConditionSelect'
import cssContent from './style.css?inline'
import templateContent from './template.html?raw'

const TAG_NAME = 'edit-panel'

const template = document.createElement('template')
template.innerHTML = templateContent

class EditPanel extends HTMLElement {
  #nameInput: HTMLInputElement
  #bountyInput: HTMLInputElement
  #conditionSelect: ConditionSelect
  #description1Input: HTMLInputElement
  #description2Input: HTMLInputElement
  #description3Input: HTMLInputElement

  #closeButton: HTMLButtonElement
  #resetButton: HTMLButtonElement

  #pointerdownListener: (e: PointerEvent) => void
  #storeListener: Parameters<typeof addListener>[1]

  constructor() {
    super()

    const shadowRoot = this.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.textContent = cssContent

    shadowRoot.append(style, template.content.cloneNode(true))

    this.#nameInput = shadowRoot.querySelector<HTMLInputElement>('#nameInput')!
    this.#bountyInput =
    shadowRoot.querySelector<HTMLInputElement>('#bountyInput')!
    this.#closeButton =
    shadowRoot.querySelector<HTMLButtonElement>('#closeButton')!
    this.#resetButton =
    shadowRoot.querySelector<HTMLButtonElement>('#resetButton')!
    this.#conditionSelect = shadowRoot.querySelector<ConditionSelect>(
      '#conditionSelect'
    )!
    this.#description1Input = shadowRoot.querySelector<HTMLInputElement>('#description1Input')!
    this.#description2Input = shadowRoot.querySelector<HTMLInputElement>('#description2Input')!
    this.#description3Input = shadowRoot.querySelector<HTMLInputElement>('#description3Input')!
    
    this.#storeListener = (key, value) => {
      value = value.toString()
      switch (key) {
        case 'name':
          this.#nameInput.value = value
          break
        case 'bounty':
          this.#bountyInput.value = value
          break
        case 'conditionSelect':
          this.#conditionSelect.value = value
          break
        case 'description1':
          this.#description1Input.value = value
          break
        case 'description2':
          this.#description2Input.value = value
          break
        case 'description3':
          this.#description3Input.value = value
          break
      }
    }

    this.#pointerdownListener = (e: PointerEvent) => {
      const isInside = e.composedPath().includes(this)
      if (isInside) {
        return
      }
      this.classList.contains('open') && this.toggle()
    }
  }

  toggle() {
    this.classList.toggle('open')
  }

  connectedCallback() {
    window.addEventListener('pointerdown', this.#pointerdownListener)

    addListener('name', this.#storeListener)
    addListener('bounty', this.#storeListener)
    addListener('description1', this.#storeListener)
    addListener('description2', this.#storeListener)
    addListener('description3', this.#storeListener)

    this.#nameInput.value = store.name
    this.#bountyInput.value = store.bounty.toString()
    this.#conditionSelect.value = store.conditionSelect.toString()
    this.#description1Input.value = store.description1
    this.#description2Input.value = store.description2
    this.#description3Input.value = store.description3

    this.#nameInput.addEventListener(
      'input',
      () => (store.name = this.#nameInput.value)
    )
  
    this.#bountyInput.addEventListener(
      'input',
      () => (store.bounty = this.#bountyInput.value)
    )

    this.#conditionSelect.addEventListener('input', () => {      
      store.conditionSelect = this.#conditionSelect.value
    })

    this.#closeButton.addEventListener('click', () => this.toggle())
    this.#resetButton.addEventListener('click', () =>
      reset({ photoUrl: store.photoUrl })
    )

    this.#description1Input.addEventListener(
      'input',
      () => (store.description1 = this.#description1Input.value)
    )

    this.#description2Input.addEventListener(
      'input',
      () => (store.description2 = this.#description2Input.value)
    )

    this.#description3Input.addEventListener(
      'input',
      () => (store.description3 = this.#description3Input.value)
    )
  }
}

customElements.define(TAG_NAME, EditPanel)

export default EditPanel
