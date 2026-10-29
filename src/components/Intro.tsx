import { useEffect, useRef } from 'react'
import { gsap } from '../lib/motion'
import { finishIntro, introPending, INTRO_SEEN_KEY } from '../lib/intro'
import { Logo } from './ui/Logo'
import './intro.css'

const SKIP_EVENTS = ['keydown', 'pointerdown', 'wheel', 'touchstart'] as const

/**
 * Intro, after the reference's sequence: the mark builds bar by bar, the frame grows in,
 * an ink band draws out from the centre and the bars sink into it, then the overlay opens
 * from that line to reveal the page (whose hero takes over from there).
 */
export function Intro() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = document.documentElement
    if (!introPending() || !ref.current) {
      finishIntro()
      return
    }
    const el = ref.current
    const bars = el.querySelectorAll('.logo-bar')
    const band = el.querySelector('.intro__band')!

    const end = () => {
      root.classList.remove('is-intro')
      try { localStorage.setItem(INTRO_SEEN_KEY, String(Date.now())) } catch { /* ignore */ }
    }

    const tl = gsap.timeline({ onComplete: end })
    tl.set(bars, { scaleY: 0, transformOrigin: '50% 100%' })
      // bars build up one after another, in small steps
      .to(bars, { scaleY: 1, duration: 0.28, ease: 'steps(4)', stagger: 0.07 })
      .addLabel('band', '+=0.15')
      .from('.frame', { borderWidth: 0, duration: 0.55, ease: 'expo.inOut' }, 'band')
      .fromTo(band, { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'expo.inOut' }, 'band')
      // the bars sink into the band
      .to(bars, { scaleY: 0, duration: 0.3, ease: 'power3.in', stagger: { each: 0.025, from: 'edges' } }, 'band+=0.35')
      .addLabel('open', 'band+=0.7')
      .call(finishIntro, [], 'open')
      // overlay opens outward from the band's line
      .to(el, { clipPath: 'inset(50% 0% 50% 0%)', duration: 0.7, ease: 'expo.inOut' }, 'open')

    if (import.meta.env.DEV) Object.assign(window, { __introTl: tl })

    const skip = () => tl.progress(1)
    SKIP_EVENTS.forEach((e) => window.addEventListener(e, skip, { once: true, passive: true }))

    return () => {
      SKIP_EVENTS.forEach((e) => window.removeEventListener(e, skip))
      tl.kill()
      gsap.set([bars, band, el, '.frame'], { clearProps: 'all' })
    }
  }, [])

  return (
    <div ref={ref} className="intro" aria-hidden="true">
      <div className="intro__stack">
        <Logo className="intro__mark" />
        <span className="intro__band" />
      </div>
      <span className="intro__hint">Press any key to skip</span>
    </div>
  )
}
