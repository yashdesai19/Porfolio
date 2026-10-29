import { useEffect, useRef } from 'react'
import { motionAllowed } from '../lib/intro'
import { canvasDpr, getTier } from '../lib/perf'

type P = { x: number; y: number; vx: number; vy: number; r: number; a: number; va: number; life: number; mood: number }

/** Original smiley sticker: outlined disc, two oval eyes, a grin. Drawn at the origin. */
function smiley(ctx: CanvasRenderingContext2D, r: number, ink: string, fill: string, mood: number) {
  ctx.lineWidth = Math.max(1.2, r * 0.09)
  ctx.strokeStyle = ink; ctx.fillStyle = fill
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
  ctx.beginPath(); ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2); ctx.stroke() // inner ring, sticker edge
  ctx.fillStyle = ink
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * r * 0.28, -r * 0.18, r * 0.08, r * 0.15, 0, 0, Math.PI * 2); ctx.fill() }
  ctx.beginPath(); ctx.arc(0, r * 0.02, r * 0.42, 0.15 * Math.PI + mood, 0.85 * Math.PI - mood); ctx.stroke()
}

/**
 * Smiley stickers burst out of a highlight cell as it opens: they pop out, tumble under gravity and fade.
 * Fixed full-viewport canvas that only exists (display + backing store) while stickers are flying;
 * runs only while the host is on screen and particles exist. Off on the low tier.
 */
export function Stickers({ host }: { host: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!motionAllowed() || getTier() === 'low') return
    const canvas = ref.current!, ctx = canvas.getContext('2d')!
    const el = document.querySelector<HTMLElement>(host)
    if (!el) return
    let W = 0, H = 0, dpr = 1, raf = 0, last = 0
    const ps: P[] = []
    const css = getComputedStyle(document.documentElement)
    const colors = () => [css.getPropertyValue('--c-fg').trim(), css.getPropertyValue('--c-bg').trim()]
    let [ink, fill] = colors()

    let active = false
    const resize = () => {
      if (!active) return
      W = window.innerWidth; H = window.innerHeight
      dpr = canvasDpr(2, W, H)
      canvas.width = W * dpr; canvas.height = H * dpr
    }
    // Show + allocate on the first sticker; hide + free the full-screen bitmap when the last one is gone
    const activate = () => { active = true; canvas.style.display = 'block'; resize() }
    const deactivate = () => { active = false; canvas.style.display = ''; canvas.width = canvas.height = 0 }
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H)
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i]
        p.vy += 1400 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.a += p.va * dt; p.life -= dt
        if (p.life <= 0 || p.y > H + 60) { ps.splice(i, 1); continue }
        const pop = Math.min(1, (1.4 - p.life) * 8) // quick scale-in
        ctx.save(); ctx.globalAlpha = Math.min(1, p.life * 2.5)
        ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.scale(pop, pop)
        smiley(ctx, p.r, ink, fill, p.mood); ctx.restore()
      }
      raf = ps.length ? requestAnimationFrame(frame) : 0
      if (!raf) deactivate()
    }
    const spawn = (x: number, y: number) => {
      ps.push({ x, y, vx: (Math.random() * 2 - 1) * 300, vy: -300 - Math.random() * 600, r: 16 + Math.random() * 10,
        a: Math.random() * 6, va: (Math.random() - 0.5) * 8, life: 1.4, mood: (Math.random() - 0.5) * 0.3 })
      if (ps.length > 40) ps.shift()
      if (!active) activate()
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame) }
    }
    const theme = new MutationObserver(() => { [ink, fill] = colors() })
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    // A cell opening (the host dispatches 'stickers:burst' with the cell) bursts a handful of stickers from its centre
    const burst = (e: Event) => {
      const r = ((e as CustomEvent<HTMLElement>).detail).getBoundingClientRect()
      for (let k = window.innerWidth > 767 ? 10 : 5; k > 0; k--) spawn(r.left + r.width / 2, r.top + r.height / 2)
    }
    el.addEventListener('stickers:burst', burst)
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf); deactivate(); theme.disconnect()
      el.removeEventListener('stickers:burst', burst)
      window.removeEventListener('resize', resize)
    }
  }, [host])

  return <canvas ref={ref} className="stickers" aria-hidden="true" />
}
