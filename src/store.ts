export interface AppState {
  photoUrl: string
  name: string
  bounty: string
  conditionSelect: string
  description1: string
  description2: string
  description3: string
}

type AppStateKey = keyof AppState

type Listener<T extends AppStateKey> = (
  key: T,
  value: AppState[T],
  store: AppState
) => void

const LISTENERS: Map<AppStateKey, Array<Listener<AppStateKey>>> = new Map()

const DEFAULT_STATE: AppState = {
  photoUrl: '',
  name: '',
  bounty: '',
  conditionSelect: 'VIVO OU MORTO',
  description1: 'Este digi escolhido está sendo procurado',
  description2: 'por causar grande confusão',
  description3: 'ele é um verdadeiro pirata digital!!!'
}

function assertIsAppStateKey(key: string | symbol): key is AppStateKey {
  return key in DEFAULT_STATE
}

const store = new Proxy<AppState>(
  { ...DEFAULT_STATE},
  {
    set(target, prop, value, receiver) {
      if (!assertIsAppStateKey(prop)) {
        return true
      }

      setTimeout(() => {
        const listeners = LISTENERS.get(prop) ?? []
        listeners.forEach((listener) => listener(prop, value, target))
      })

      return Reflect.set(target, prop, value, receiver)
    }
  }
)

export function addListener(key: AppStateKey, listener: Listener<AppStateKey>) {
  let listeners = LISTENERS.get(key)
  if (!listeners) {
    listeners = []
    LISTENERS.set(key, listeners)
  }
  listeners.push(listener)
}

export function removeListener<T extends AppStateKey>(
  key: T,
  listener: Listener<T>
) {
  const listeners = LISTENERS.get(key)
  if (!listeners) {
    return
  }
  const index = listeners.findIndex((l) => l === listener)
  if (index > -1) {
    listeners.splice(index, 1)
  }
}

export function update(state: Partial<AppState> = {}) {
  Object.assign(store, {
    ...store,
    ...state
  })
}

export function reset(state: Partial<AppState> = {}) {
  Object.assign(store, { ...DEFAULT_STATE, ...state })
}

export default store
