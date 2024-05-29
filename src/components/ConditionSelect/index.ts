import templateContent from './template.html?raw'
import store, { addListener } from '../../store'
import cssContent from './style.css?inline'

const TAG_NAME = 'condition-select'

const template = document.createElement('template')
template.innerHTML = templateContent

class ConditionSelect extends HTMLElement {
  #select: HTMLSelectElement

  constructor() {
    super()

    const shadowRoot = this.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.textContent = cssContent

    shadowRoot.append(style, template.content.cloneNode(true))

    this.#select = shadowRoot.querySelector('select') as HTMLSelectElement
    
    const opt1 = document.createElement("option");
    opt1.value = "VIVO OU MORTO";
    opt1.text = "Vivo ou morto";
    this.#select.add(opt1)

    const opt2 = document.createElement("option");
    opt2.value = "APENAS MORTO";
    opt2.text = "Apenas morto";
    this.#select.add(opt2)

    const opt3 = document.createElement("option");
    opt3.value = "APENAS VIVO";
    opt3.text = "Apenas vivo";
    this.#select.add(opt3)

    addListener('conditionSelect', () => {
      this.#select.value = store.conditionSelect
    })
  }

  get value() {
    return this.#select.value
  }

  set value(v: string) {
    this.#select.value = v
  }
}

customElements.define(TAG_NAME, ConditionSelect)

export default ConditionSelect
