import { useEffect, useRef } from 'react'
import { site } from '../content/site'
import { gsap } from '../lib/motion'
import { introDone, motionAllowed } from '../lib/intro'
import { HeroLines } from './HeroLines'
import { Ticker } from './Ticker'
import './hero.css'

const [left, right] = site.hero.split
// 'AI Product' → 'AI' + 'Product': separate cells, so on phones the star can sit under AI and Builder under Product
const [leftA, ...leftRest] = left.split(' ')
const leftB = leftRest.join(' ')
const DIRS = ['left', 'right', 'up', 'down'] as const

/** Scale the headline so it spans the full width exactly (one line, edge to edge). */
function fit(title: HTMLElement) {
  const inner = title.querySelector<HTMLElement>('.hero__visual')!
  title.style.fontSize = '100px'
  const w = inner.scrollWidth
  const cs = getComputedStyle(title)
  const avail = title.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
  if (w) title.style.fontSize = `${Math.floor(((100 * avail) / w) * 0.995)}px`
}

/** Each glyph is a window onto a plus-shaped cluster of copies; flipping slides the next copy in. */
function Word({ text, className = '' }: { text: string; className?: string }) {
  return (
    <span className={`hero__word ${className}`}>
      {[...text].map((ch, i) =>
        ch === ' '
          ? <span key={i} className="char char--space"> </span>
          : <span key={i} className="char"><span className="char__inner" data-letter={ch}>{ch}</span></span>,
      )}
    </span>
  )
}

export function Hero() {
  const ref = useRef<HTMLElement>(null)

  // Fit runs for everyone (including reduced motion); re-fit on resize and after fonts load
  useEffect(() => {
    const title = ref.current!.querySelector<HTMLElement>('.hero__title')!
    const run = () => fit(title)
    run()
    document.fonts.ready.then(run)
    const ro = new ResizeObserver(() => requestAnimationFrame(run)) // fitting changes layout: do it next frame
    ro.observe(ref.current!)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!motionAllowed()) return
    const section = ref.current!
    const visual = section.querySelector<HTMLElement>('.hero__visual')!
    const chars = [...section.querySelectorAll<HTMLElement>('.char:not(.char--space)')]
    let cancelled = false
    let tl: gsap.core.Timeline | undefined
    let ambient = 0

    // Flip: add a direction class; when the slide ends, drop it (the copy that slid in is identical)
    const flip = (c: HTMLElement, dir: (typeof DIRS)[number]) => {
      if (c.dataset.flipping) return
      c.dataset.flipping = '1'
      c.classList.add(`flip-${dir}`)
    }
    const onEnd = (e: AnimationEvent) => {
      const c = (e.target as HTMLElement).parentElement!
      DIRS.forEach((d) => c.classList.remove(`flip-${d}`))
      delete c.dataset.flipping
    }
    // Flips are ambient only (no hover trigger)
    chars.forEach((c) => c.addEventListener('animationend', onEnd))

    Promise.all([introDone, document.fonts.ready]).then(() => {
      if (cancelled) return
      fit(section.querySelector<HTMLElement>('.hero__title')!)
      tl = gsap.timeline()
      tl.set(visual, { autoAlpha: 1 })
        .from(section.querySelectorAll('.char__inner'), { yPercent: 100, duration: 1, ease: 'expo.out', stagger: { each: 0.04, from: 'center' } })
        .from('.hero__star', { scale: 0, rotate: -180, duration: 1, ease: 'expo.out' }, 0.3)
        // (the wave lines fade in from both edges on their own canvas: HeroLines.tsx)
        .from(section.querySelectorAll('.ticker'), { clipPath: 'inset(0 50% 0 50%)', duration: 1, ease: 'expo.inOut', stagger: 0.1 }, 0.1)
        .add(() => {
          // Ambient: every couple of seconds a random glyph slides sideways. Only left/right: those copies
          // sit on the same line, so the glyph keeps its size (up/down copies looked small mid-flip)
          const tick = () => {
            flip(chars[(Math.random() * chars.length) | 0], Math.random() < 0.5 ? 'left' : 'right')
            ambient = window.setTimeout(tick, 1400 + Math.random() * 1600)
          }
          ambient = window.setTimeout(tick, 1200)
        })
    })

    return () => {
      cancelled = true
      window.clearTimeout(ambient)
      chars.forEach((c) => c.removeEventListener('animationend', onEnd))
      tl?.revert()
    }
  }, [])

  return (
    <section id="top" ref={ref} className="hero" aria-labelledby="hero-h">
      <HeroLines />
      <Ticker seed={1} />
      <h1 id="hero-h" className="hero__title display">
        <span className="sr-only">{site.hero.lines.join(' ')}</span>
        <span className="hero__visual" aria-hidden="true">
          <Word text={leftA} className="hero__word--a" />
          <span className="char char--space hero__gap"> </span>
          <Word text={leftB} className="hero__word--b" />
          <svg className="hero__star" viewBox="0 0 40 40"><path d="M20 0 L22.5 17.5 L40 20 L22.5 22.5 L20 40 L17.5 22.5 L0 20 L17.5 17.5 Z" /></svg>
          <Word text={right} className="hero__word--c" />
        </span>
      </h1>
      <Ticker seed={7} reverse />
    </section>
  )
}
