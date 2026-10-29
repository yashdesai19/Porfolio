// Adaptive quality. The <head> script in index.html sets html[data-perf] = high | mid | low from
// device hints (Save-Data, memory, cores, coarse pointer), a remembered downgrade, or ?perf=…
// A watchdog steps the tier down at runtime when scrolling drops frames; it never steps up.
import { gsap } from 'gsap'

export type Tier = 'high' | 'mid' | 'low'
const ORDER: Tier[] = ['low', 'mid', 'high']
const STORE_KEY = 'perfTier'

export function getTier(): Tier {
  if (typeof document === 'undefined') return 'high'
  const t = document.documentElement.dataset.perf
  return t === 'low' || t === 'mid' ? t : 'high'
}

/** Value for the current tier, e.g. pick({ high: 3, mid: 2, low: 1 }). */
export const pick = <T,>(v: Record<Tier, T>): T => v[getTier()]

const subs = new Set<(t: Tier) => void>()
export function onTierChange(cb: (t: Tier) => void) {
  subs.add(cb)
  return () => { subs.delete(cb) }
}

function setTier(t: Tier) {
  document.documentElement.dataset.perf = t
  // Remember the downgrade for a week (not while a tier is forced with ?perf=)
  if (!/[?&]perf=/.test(location.search)) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ tier: t, t: Date.now() })) } catch { /* storage unavailable */ }
  }
  subs.forEach((cb) => cb(t))
}

export const saveData = () =>
  typeof navigator !== 'undefined' && !!(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData

/** Canvas pixel ratio: device ratio, capped per caller and by a backing-store budget (~8 MP). */
export function canvasDpr(cap: number, w: number, h: number) {
  const budget = Math.sqrt(8e6 / Math.max(1, w * h))
  return Math.min(window.devicePixelRatio || 1, cap, Math.max(1, budget))
}

let lastScroll = -1e9
export const isScrolling = () => performance.now() - lastScroll < 150

/**
 * Frame watchdog on GSAP's ticker (no extra rAF). Learns the idle frame interval first, then
 * counts frames slower than 1.7× that interval while the page scrolls. More than 20% slow frames
 * in two consecutive 2 s windows → one tier down. Returns cleanup.
 */
export function startWatchdog(): () => void {
  if (/[?&]perf=/.test(location.search)) return () => {} // tier forced for testing: keep it fixed
  const onScroll = () => { lastScroll = performance.now() }
  window.addEventListener('scroll', onScroll, { passive: true })
  const idle: number[] = []
  let base = 0, slow = 0, total = 0, from = 0, bad = 0

  const tick = (_time: number, dt: number) => {
    if (document.hidden) return
    if (!base) {
      if (!isScrolling()) idle.push(dt)
      if (idle.length >= 60) base = idle.sort((a, b) => a - b)[15] // lower quartile ≈ vsync interval
      return
    }
    if (!isScrolling()) return
    const now = performance.now()
    if (!from) from = now
    total++
    if (dt > base * 1.7) slow++
    if (now - from < 2000) return
    bad = total > 20 && slow / total > 0.2 ? bad + 1 : 0
    slow = total = from = 0
    if (bad < 2) return
    bad = 0
    const i = ORDER.indexOf(getTier())
    if (i > 0) setTier(ORDER[i - 1])
    if (i <= 1) stop()
  }
  const stop = () => {
    gsap.ticker.remove(tick)
    window.removeEventListener('scroll', onScroll)
  }
  gsap.ticker.add(tick)
  return stop
}
