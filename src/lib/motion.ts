import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'
import { introDone, introPending, motionAllowed } from './intro'
import { getTier, onTierChange } from './perf'

gsap.registerPlugin(ScrollTrigger, SplitText)

export { gsap, ScrollTrigger, SplitText }

let lenis: Lenis | null = null
export const getLenis = () => lenis

/**
 * Lenis driven by GSAP's ticker so ScrollTrigger stays in sync. Returns cleanup.
 * Lenis scrolls on the main thread, so main-thread jank becomes scroll jank: the low tier
 * keeps native (threaded) scrolling, and a watchdog drop to low removes Lenis on the fly.
 */
export function initSmoothScroll(): () => void {
  if (!motionAllowed() || getTier() === 'low') return () => {}
  lenis = new Lenis({ lerp: 0.1, anchors: true })
  lenis.on('scroll', ScrollTrigger.update)
  if (introPending()) {
    lenis.stop()
    introDone.then(() => lenis?.start())
  }
  const tick = (time: number) => lenis?.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  const kill = () => {
    gsap.ticker.remove(tick)
    lenis?.destroy()
    lenis = null
  }
  const offTier = onTierChange((t) => { if (t === 'low') kill() })
  return () => { offTier(); kill() }
}
