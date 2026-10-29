import { useEffect, useRef } from 'react'
import { site } from '../content/site'
import { gsap, ScrollTrigger } from '../lib/motion'
import { motionAllowed } from '../lib/intro'
import { Stickers } from './Stickers'
import './about.css'

type Cell = { area: string; kind: 'text' | 'name' | 'icon'; title?: string; note?: string; size?: 'xl' | 'l' | 'm' }

const [h1, h2, h3, h4] = site.about.highlights
const strip = (s: string) => s.replace(/\.$/, '')
// 4 × 6 grid (row-start / col-start / row-end / col-end); uncovered slots show the hatch
const CELLS: Cell[] = [
  { area: '1 / 1 / 2 / 5', kind: 'text', title: `${h1.label} of ${h1.accent}`, note: strip(h1.detail) },
  { area: '2 / 1 / 4 / 3', kind: 'name', title: 'AI', note: h2.label, size: 'xl' },
  { area: '2 / 3 / 3 / 5', kind: 'text', title: `${h2.accent} ${strip(h2.detail).toLowerCase()}` },
  { area: '3 / 4 / 4 / 5', kind: 'name', title: 'API', note: h3.label.replace(' ', '\n'), size: 'm' },
  { area: '4 / 1 / 5 / 5', kind: 'text', title: `${h3.accent}, ${strip(h3.detail)}` },
  { area: '5 / 1 / 6 / 2', kind: 'icon' },
  { area: '5 / 2 / 6 / 5', kind: 'name', title: h4.label, note: `${h4.accent}, ${strip(h4.detail).toLowerCase()}`, size: 'l' },
  { area: '6 / 2 / 7 / 5', kind: 'text', title: 'Always learning', note: 'Challenging myself to learn something new' }, // paraphrased from the approved bio
]

const Star = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 40 40" aria-hidden="true"><path d="M20 0 L22.5 17.5 L40 20 L22.5 22.5 L20 40 L17.5 22.5 L0 20 L17.5 17.5 Z" /></svg>
)

export function About() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!motionAllowed()) return
    const section = ref.current!
    section.classList.add('is-motion')
    const ctx = gsap.context(() => {
      // Corridor walls: grid lines travel toward the viewer as you scroll. The plane moves by transform,
      // wrapped to the 240px grid period, instead of background-position: no repaint per frame
      const wrapY = gsap.utils.wrap(-120, 120)
      gsap.utils.toArray<HTMLElement>('.wall__plane').forEach((plane, i) => {
        gsap.set(plane, { rotationY: i === 0 ? 68 : -68 })
        gsap.fromTo(plane, { y: 0 }, {
          y: 1600, ease: 'none', modifiers: { y: (v: string) => `${wrapY(parseFloat(v)).toFixed(1)}px` },
          scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
        })
      })
      // The column drifts slightly against the scroll (parallax)
      gsap.fromTo('.about__col', { y: 80 }, { y: -80, ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true } })
    }, section)

    // Scroll-linked reveal: each cell's progress (--p, 0 → 1) follows its position in the viewport,
    // so the cover wipes off exactly as fast as the visitor scrolls
    const cells = [...section.querySelectorAll<HTMLElement>('.award')]
    const easeP = gsap.parseEase('power2.inOut')
    const last: string[] = []
    const reveal = () => {
      const vh = window.innerHeight
      // all reads first, then writes (interleaving them forced a style recalc per cell)
      const tops = cells.map((c) => c.getBoundingClientRect().top)
      cells.forEach((c, i) => {
        // starts as the cell enters at the bottom, done once its top reaches 55% of the screen
        // once a cell has opened it stays open (scrolling back up does not close it again, as in the reference)
        const p = Math.max(Number(last[i] ?? 0), easeP(Math.min(1, Math.max(0, (vh - tops[i]) / (vh * 0.45))))).toFixed(3)
        // the moment it is (almost) fully open, it bursts smileys, once
        if (Number(p) > 0.9 && Number(last[i] ?? 0) <= 0.9) section.dispatchEvent(new CustomEvent('stickers:burst', { detail: c }))
        if (p !== last[i]) { last[i] = p; c.style.setProperty('--p', p) }
      })
    }
    const st = ScrollTrigger.create({ trigger: section, start: 'top bottom', end: 'bottom top', onUpdate: reveal, onRefresh: reveal })
    reveal()

    // Press feedback: a cell squeezes while pressed (stickers burst from the Stickers layer)
    const down = (e: Event) => (e.currentTarget as HTMLElement).classList.add('is-active')
    const up = (e: Event) => (e.currentTarget as HTMLElement).classList.remove('is-active')
    cells.forEach((c) => { c.addEventListener('pointerdown', down); c.addEventListener('pointerup', up); c.addEventListener('pointerleave', up) })

    return () => {
      ctx.revert(); st.kill(); section.classList.remove('is-motion')
      cells.forEach((c) => c.style.removeProperty('--p')); last.length = 0
      cells.forEach((c) => { c.removeEventListener('pointerdown', down); c.removeEventListener('pointerup', up); c.removeEventListener('pointerleave', up) })
    }
  }, [])

  return (
    <section id="about" ref={ref} className="section about" aria-labelledby="about-h">
      <div className="about__corridor" aria-hidden="true">
        <div className="about__walls">
          <div className="wall wall--l"><div className="wall__plane" /></div>
          <div className="wall wall--r"><div className="wall__plane" /></div>
        </div>
      </div>
      <Stickers host="#about" />

      <div className="about__col">
        <h2 id="about-h" className="about__bar">About</h2>
        <div className="about__text serif">
          <p>{site.about.lead}</p>
          {site.about.paragraphs.map((p) => <p key={p}>{p}</p>)}
        </div>

        <h3 className="about__bar">Highlights</h3>
        <ul className="awards">
          {CELLS.map((c, i) => (
            <li key={i} className={`award award--${c.kind}${c.size ? ` award--${c.size}` : ''}`} style={{ gridArea: c.area }}>
              <span className="award__inner">
                {c.kind === 'icon' && <><Star className="award__icon" /><Star className="award__tick award__tick--tl" /><Star className="award__tick award__tick--tr" /><Star className="award__tick award__tick--bl" /><Star className="award__tick award__tick--br" /></>}
                {c.kind === 'name' && <><span className="award__name display">{c.title}</span><span className="award__counter serif">({c.note})</span></>}
                {c.kind === 'text' && <><span className="award__text serif">{c.title}</span>{c.note && <span className="award__counter serif">{c.note}</span>}</>}
              </span>
              <span className="award__mask" aria-hidden="true" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
