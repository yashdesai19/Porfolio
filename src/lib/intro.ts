// Coordinates intro → page entrance. The <head> script in index.html sets:
//   html.motion — motion allowed (no prefers-reduced-motion)
//   html.is-intro — intro should play (motion allowed; it plays on every load and refresh)
let resolveIntro!: () => void
export const introDone = new Promise<void>((r) => (resolveIntro = r))
export const finishIntro = () => resolveIntro()

const has = (c: string) => typeof document !== 'undefined' && document.documentElement.classList.contains(c)
export const motionAllowed = () => has('motion')
export const introPending = () => has('is-intro')

export const INTRO_SEEN_KEY = 'introSeen'
