import { useEffect, useRef } from 'react'
import { site } from '../content/site'
import { motionAllowed } from '../lib/intro'
import { getLenis } from '../lib/motion'
import { pick } from '../lib/perf'
import { Logo } from './ui/Logo'
import './personal.css'

type Obj = (typeof site.personal.objects)[number]
const objects = site.personal.objects

// A framed print shows the project's real poster when one exists (test clips are skipped), else just its name
const posterFor = (label?: string) => {
  const p = site.projects.find((x) => x.published && x.title.toLowerCase().replace(/\s+hiring$/, '') === label?.toLowerCase())
  return p?.clips.map((c) => c.poster).find((src) => src && !src.includes('/media/test/'))
}

function ObjectArt({ o }: { o: Obj }) {
  switch (o.kind) {
    case 'logo': return <span className="slab slab--light"><Logo className="pobj__logo" /></span>
    case 'ring': return <span className="pobj__ring" />
    case 'disc': return <span className="pobj__disc" />
    case 'star': return (
      <span className="pobj__star3d">
        <svg viewBox="0 0 40 40" className="pobj__star"><path d="M20 0 L23 17 L40 20 L23 23 L20 40 L17 23 L0 20 L17 17 Z" /></svg>
        <svg viewBox="0 0 40 40" className="pobj__star pobj__star--back"><path d="M20 0 L23 17 L40 20 L23 23 L20 40 L17 23 L0 20 L17 17 Z" /></svg>
      </span>
    )
    case 'square': return <span className="slab slab--ink" />
    case 'code': return <span className="slab slab--accent pobj__code">{o.label}</span>
    case 'image': return o.src ? <span className="slab"><img src={o.src} alt="" loading="lazy" draggable={false} /></span> : null
    default: return (
      // 3D framed print: matte frame + caption on the front, a back face and four side walls
      <span className="frame3d">
        {(() => {
          const src = posterFor(o.label)
          return src
            ? <span className="frame3d__img frame3d__img--photo"><img src={src} alt="" loading="lazy" decoding="async" draggable={false} /></span>
            : <span className="frame3d__img">{o.label}</span>
        })()}
        <span className="frame3d__cap">{o.label}</span>
        <span className="frame3d__side frame3d__side--l" /><span className="frame3d__side frame3d__side--r" />
        <span className="frame3d__side frame3d__side--t" /><span className="frame3d__side frame3d__side--b" />
        <span className="frame3d__back" />
      </span>
    )
  }
}

/** Original smiley sun: ringed disc with a lopsided grin. */
function Sun() {
  return (
    <svg className="personal__sun" viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r="56" className="sun__disc" />
      <circle cx="60" cy="60" r="44" className="sun__ring" />
      <ellipse cx="45" cy="48" rx="5" ry="9" className="sun__eye" />
      <ellipse cx="73" cy="46" rx="5" ry="9" className="sun__eye" />
      <path d="M36 70 Q60 94 86 66" className="sun__smile" />
    </svg>
  )
}

const Text = ({ mod }: { mod: string }) => (
  <div className={`catcher__text catcher__text--${mod}`}>
    {site.personal.lines.map((l, i) => (
      // A leading '&' is set in the italic serif: an editorial accent that keeps the last line light
      <span key={i}>{l.startsWith('& ') ? <><em className="catcher__amp">&amp;</em>{l.slice(2)}</> : l}</span>
    ))}
  </div>
)

/** One thrown object: flies out of the sun toward the viewer; can be grabbed, and falls away when released. */
type Flyer = {
  el: HTMLElement; i: number; s: number; x: number; y: number; z: number; rx: number; ry: number; rz: number
  vx: number; vy: number; vz: number; vrx: number; vry: number; dragging: boolean; vanishAt: number
}

/**
 * Same mechanics as the reference "my way" section: straight rays from the sun to the frame edges,
 * objects thrown from far behind the sun on a timer, and a headline that slides toward the viewer
 * across the horizon — tilted back above it, upright below — driven by smoothed scroll progress.
 */
export function Personal() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = ref.current!
    const svgPath = section.querySelector<SVGPathElement>('.personal__rays path')!
    const svg = section.querySelector<SVGSVGElement>('.personal__rays')!
    const sun = section.querySelector<SVGElement>('.personal__sun')!
    const wrap = section.querySelector<HTMLElement>('.personal__objects')!
    const catcher = section.querySelector<HTMLElement>('.personal__catcher')!
    let W = 0, H = 0, sunX = 0, sunY = 0, top = 0

    // Rays: from the sun to evenly spaced points on every edge, plus the horizon line
    const layout = () => {
      const r = section.getBoundingClientRect()
      W = r.width; H = r.height; top = r.top + window.scrollY
      const s = sun.getBoundingClientRect()
      sunX = s.left - r.left + s.width / 2; sunY = s.top - r.top + s.height / 2
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
      const n = window.innerWidth > 767 ? 12 : 8, cw = W / n, rh = H / n
      let d = `M0 ${H}L${W} ${H}`
      for (let c = 0; c <= n; c++) d += `M${cw * c} 0L${sunX} ${sunY}M${cw * c} ${H}L${sunX} ${sunY}`
      for (let c = 1; c < n; c++) d += `M0 ${rh * c}L${sunX} ${sunY}M${W} ${rh * c}L${sunX} ${sunY}`
      svgPath.setAttribute('d', d)
      section.style.setProperty('--distortion', (Math.hypot(W, (H - sunY) / 2) * 0.14).toFixed(2))
      // Objects vanish toward the sun: the wrapper reaches 100vh above the section
      wrap.style.perspectiveOrigin = `50% ${window.innerHeight + sunY}px`
      // One size for every line, as large as the longest line allows
      const probe = catcher.querySelector<HTMLElement>('.catcher__text--normal')!
      catcher.style.removeProperty('--fs')
      const widest = Math.max(...[...probe.children].map((c) => (c as HTMLElement).scrollWidth))
      const fs = parseFloat(getComputedStyle(catcher).fontSize)
      if (widest > 0) catcher.style.setProperty('--fs', `${Math.min(fs, (fs * window.innerWidth * (window.innerWidth > 767 ? 0.58 : 0.84)) / widest).toFixed(1)}px`)
    }
    layout()
    const ro = new ResizeObserver(() => requestAnimationFrame(layout)); ro.observe(section) // layout resizes the section: do it next frame
    document.fonts?.ready.then(layout)

    if (!motionAllowed()) { section.style.setProperty('--scroll-progress', '0.5'); return () => ro.disconnect() }

    // Thrown objects
    const els = [...wrap.querySelectorAll<HTMLElement>('.pobj')]
    const pool: Flyer[] = els.map((el, i) => ({ el, i, s: 0, x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, vx: 0, vy: 0, vz: 0, vrx: 0, vry: 0, dragging: false, vanishAt: 0 }))
    const flying: Flyer[] = []
    const set = (f: Flyer, thrown = true) => {
      f.el.style.setProperty('--size', String(0.5 + Math.random() * 0.5))
      Object.assign(f, {
        s: 0, x: 0, y: 0, z: -20000, rx: 90, ry: Math.random() * 2 - 1, rz: 0, vz: 40 + Math.random() * 10,
        vx: Math.random() * window.innerWidth * 0.0025 * (f.i % 2 ? -1 : 1), vy: Math.random() * window.innerHeight * 0.0025 * (f.i % 3 ? -1 : 1),
        vrx: 0.25 + Math.random(), vry: 0.25 + Math.random(), dragging: false, vanishAt: 0,
      })
      if (!thrown) Object.assign(f, { s: 1, x: f.vx * Math.random() * 200, y: f.vy * Math.random() * 200, rx: Math.random() * 360, ry: Math.random() * 360, z: Math.random() * -20000 })
      f.el.classList.remove('is-waiting', 'is-dragging', 'is-vanishing')
      flying.push(f)
    }
    const take = () => pool.splice(Math.floor(Math.random() * pool.length), 1)[0]
    const retire = (f: Flyer) => { f.el.classList.add('is-waiting'); flying.splice(flying.indexOf(f), 1); pool.push(f) }
    els.forEach((el) => el.classList.add('is-waiting'))
    for (let k = Math.max(2, Math.min(5, Math.round(window.innerWidth * 0.025))); k > 0 && pool.length; k--) set(take(), false)

    const mouse = { x: 0, y: 0 }
    let dragged: Flyer | null = null
    // Only while the section is on screen (this listens on window); one rect read per event at most
    const onMove = (e: PointerEvent) => { if (!visible && !dragged) return; const r = section.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top }
    const onDown = (e: PointerEvent) => {
      const f = flying.find((o) => o.el === e.currentTarget)
      if (!f || f.vanishAt) return
      e.preventDefault(); onMove(e)
      dragged = f; f.dragging = true; f.el.classList.add('is-dragging')
    }
    const onUp = () => {
      const f = dragged; if (!f) return
      dragged = null; f.dragging = false; f.el.classList.remove('is-dragging')
      f.vanishAt = performance.now(); f.el.classList.add('is-vanishing')
    }
    els.forEach((el) => el.addEventListener('pointerdown', onDown))
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerup', onUp)

    let raf = 0, visible = false, last = 0, lastThrow = 0, throwDelay = 0, sp = -1
    const maxFlying = pick({ high: 5, mid: 4, low: 3 })
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick)
      const k = Math.min(3, (t - (last || t)) / 16.667 || 1); last = t
      // Smoothed scroll progress drives the headline
      const vh = window.innerHeight, start = top, end = top + H + vh
      const p = Math.min(1, Math.max(0, ((getLenis()?.scroll ?? window.scrollY) + vh - start) / (end - start)))
      const prev = sp
      sp = sp < 0 ? p : sp + (p - sp) * Math.min(1, 0.1 * k)
      // set on the headline only (a custom property on the section restyled everything inside it), and only when it moved
      if (Math.abs(sp - prev) > 1e-4) catcher.style.setProperty('--scroll-progress', sp.toFixed(4))

      if (t - lastThrow > throwDelay && flying.length < maxFlying && pool.length) {
        set(take()); lastThrow = t; throwDelay = (500 + Math.random() * 500) * (window.innerWidth > 767 ? 1.25 : 2)
      }
      for (let fi = flying.length - 1; fi >= 0; fi--) {
        const f = flying[fi] // backwards: retire() removes from this array
        if (f.dragging) {
          const tx = mouse.x - W / 2, ty = mouse.y - H / 2
          f.vx += (tx - f.x) * 0.075 * k; f.vy += (ty - f.y) * 0.075 * k; f.vz += (0 - f.z) * 0.3 * k
          f.ry = f.vx * 0.15; f.rx = f.vy * -0.15; f.rz = f.ry + f.rx
          f.vx *= 0.9; f.vy *= 0.9; f.vz *= 0.75
          f.x += f.vx * 0.5 * k; f.y += f.vy * 0.5 * k; f.z = Math.min(500, f.z + f.vz * 0.25 * k); f.s += (1 - f.s) * 0.5
        } else if (f.vanishAt) {
          f.vy += 0.5 * k; f.x += f.vx * k; f.y += f.vy * k; f.rx += f.vrx * k; f.ry += f.vry * k
          if (t - f.vanishAt > 1000) { retire(f); continue }
        } else if (f.z > 1000) { retire(f); continue }
        else {
          f.s = Math.min(1, f.s + 0.005 * k); f.z += f.vz * k; f.x += f.vx * k; f.y += f.vy * k; f.rx += f.vrx * k; f.ry += f.vry * k
        }
        f.el.style.transform = `translate3d(calc(${f.x.toFixed(1)}px - 50%), calc(${f.y.toFixed(1)}px - 50%), ${f.z.toFixed(1)}px) rotateX(${f.rx.toFixed(2)}deg) rotateY(${f.ry.toFixed(2)}deg) rotate(${f.rz.toFixed(2)}deg) scale(${f.s.toFixed(3)})`
      }
    }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible && !raf) { last = 0; raf = requestAnimationFrame(tick) }
      else if (!visible) { cancelAnimationFrame(raf); raf = 0 }
    }, { rootMargin: '50% 0px' })
    io.observe(section)

    return () => {
      cancelAnimationFrame(raf); io.disconnect(); ro.disconnect()
      els.forEach((el) => { el.removeEventListener('pointerdown', onDown); el.style.transform = ''; el.classList.remove('is-waiting', 'is-dragging', 'is-vanishing') })
      window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp)
    }
  }, [])

  return (
    <section id="personal" ref={ref} className="section personal" aria-labelledby="personal-h">
      <h2 id="personal-h" className="sr-only">{site.personal.title}: {site.personal.lines.join(' ')}</h2>
      <Sun />
      <div className="personal__objects" aria-hidden="true">
        {objects.map((o, i) => <div key={i} className={`pobj pobj--${o.kind}`}><ObjectArt o={o} /></div>)}
      </div>
      <div className="personal__catcher" aria-hidden="true">
        <div className="catcher__distorted-wrap"><div className="catcher__distorted"><Text mod="distorted" /></div></div>
        <div className="catcher__normal-wrap"><div className="catcher__normal"><Text mod="normal" /></div></div>
      </div>
      <svg className="personal__rays" aria-hidden="true"><path /></svg>
    </section>
  )
}
