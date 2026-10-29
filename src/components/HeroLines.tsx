import { useEffect, useRef } from 'react'
import { introDone, motionAllowed } from '../lib/intro'
import { canvasDpr, getTier, onTierChange, pick } from '../lib/perf'

const POINTS = 22 // vertices per line (polyline, so the bends read as sharp folds)
const RADIUS = 130 // pointer reach (px)
const STEP = 1000 / 60 // physics runs in fixed 60 Hz steps: same feel at 30, 60 or 120 fps

/**
 * A curtain of vertical polylines. A slow field sways them; moving the pointer drags nearby
 * vertices along with its velocity, and springs pull them back — like running a hand through
 * fabric. A small dot trails the pointer.
 * Drawn on one canvas as a single path (one stroke per frame, no DOM work); the lines appear
 * from both edges toward the centre once the intro is done.
 */
export function HeroLines() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current!
    const canvas = root.querySelector('canvas')!
    const ctx = canvas.getContext('2d')!
    const dot = root.querySelector<HTMLElement>('.hero__dot')!
    const animate = motionAllowed()
    let W = 0, H = 0, n = 0, dpr = 1, stroke = ''
    let ox = new Float32Array(0), vx = new Float32Array(0) // per-vertex offset and velocity (x only; reads best)
    let cx = 0, cy = 0, px = -1e4, py = -1e4, lpx = -1e4, lpy = -1e4, dx = -1e4, dy = -1e4, inside = false
    let raf = 0, visible = false, ready = false, last = 0, acc = 0, settled = true, revealAt = -1

    const build = () => {
      const r = root.getBoundingClientRect()
      W = r.width; H = r.height
      dpr = canvasDpr(pick({ high: 2, mid: 2, low: 1.5 }), W, H)
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr)
      n = Math.max(24, Math.round(W / pick({ high: 8.5, mid: 8.5, low: 12 })))
      ox = new Float32Array(n * POINTS); vx = new Float32Array(n * POINTS)
      stroke = getComputedStyle(root).color
    }

    // Slow base field: gentle lean that varies across the width and drifts in time
    const base = (u: number, v: number, t: number) =>
      10 * Math.sin(u * 6.5 + t * 0.35 + v * 1.4) + 6 * Math.sin(u * 17 - t * 0.5 + v * 3)

    // One 60 Hz physics step; skipped entirely once every vertex is back home and the pointer is away
    const step = (mvx: number, mvy: number) => {
      let moving = false
      for (let i = 0; i < n; i++) {
        const x0 = ((i + 0.5) * W) / n
        for (let k = 0; k < POINTS; k++) {
          const j = i * POINTS + k
          if (inside) {
            const ddx = x0 + ox[j] - px, ddy = (k / (POINTS - 1)) * H - py
            const f = Math.exp(-(ddx * ddx + ddy * ddy) / (2 * RADIUS * RADIUS))
            vx[j] += (mvx * 0.9 + mvy * 0.25 * Math.sign(ddx)) * f // drag along the motion
          }
          vx[j] += -ox[j] * 0.045 // spring home
          vx[j] *= 0.86 // damping
          ox[j] += vx[j]
          if (!moving && (ox[j] > 0.02 || ox[j] < -0.02 || vx[j] > 0.02 || vx[j] < -0.02)) moving = true
        }
      }
      settled = !moving
    }

    const draw = (t: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      if (animate && revealAt < 0) return // hidden until the reveal
      ctx.strokeStyle = stroke; ctx.lineWidth = 1
      const rv = animate ? t - revealAt : 1e9 // seconds since the reveal started
      const revealing = rv < 1.4
      if (!revealing) ctx.beginPath()
      for (let i = 0; i < n; i++) {
        if (revealing) {
          // fade in from both edges toward the centre (0.5 s each, spread over 0.9 s)
          const e = Math.min(i, n - 1 - i) / ((n - 1) / 2)
          const a = Math.min(1, Math.max(0, (rv - e * 0.9) / 0.5))
          if (a <= 0) continue
          ctx.globalAlpha = 1 - (1 - a) * (1 - a)
          ctx.beginPath()
        }
        const x0 = ((i + 0.5) * W) / n, u = x0 / W
        for (let k = 0; k < POINTS; k++) {
          const v = k / (POINTS - 1)
          const x = x0 + base(u, v, t) * (0.3 + 0.7 * v) + ox[i * POINTS + k]
          if (k) ctx.lineTo(x, v * H); else ctx.moveTo(x, v * H)
        }
        if (revealing) ctx.stroke()
      }
      if (revealing) ctx.globalAlpha = 1
      else ctx.stroke()
    }

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      // Ambient sway runs at 30 fps on weaker tiers (full rate while the pointer is in the band on mid)
      const tier = getTier(), gap = tier === 'low' || (tier === 'mid' && !inside) ? 32 : 0
      if (last && now - last < gap) return
      const dtMs = last ? Math.min(100, now - last) : STEP
      last = now
      if (inside) { const r = root.getBoundingClientRect(); px = cx - r.left; py = cy - r.top }
      acc += dtMs
      const steps = Math.min(4, Math.floor(acc / STEP))
      acc -= steps * STEP
      // pointer velocity, spread over this frame's steps
      const mvx = inside && steps ? (px - lpx) / steps : 0, mvy = inside && steps ? (py - lpy) / steps : 0
      lpx = px; lpy = py
      if (inside || !settled) for (let s = 0; s < steps; s++) step(mvx, mvy)
      draw(now / 1000)
      // trailing dot
      const a = 1 - Math.pow(1 - 0.18, dtMs / STEP)
      dx += (px - dx) * a; dy += (py - dy) * a
      dot.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`
    }
    const start = () => { if (!raf && ready && visible) { last = 0; acc = 0; raf = requestAnimationFrame(loop) } }
    const stop = () => { cancelAnimationFrame(raf); raf = 0 }

    build(); draw(0)
    const redraw = () => { if (!raf) draw(performance.now() / 1000) }
    const ro = new ResizeObserver(() => requestAnimationFrame(() => { build(); redraw() }))
    ro.observe(root)
    const theme = new MutationObserver(() => { stroke = getComputedStyle(root).color; redraw() })
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    if (!animate) return () => { ro.disconnect(); theme.disconnect() }

    const offTier = onTierChange(() => { build(); redraw() })
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); else stop() })
    io.observe(root)
    // Nothing runs under the intro; the lines fade in with the headline
    let cancelled = false
    Promise.all([introDone, document.fonts.ready]).then(() => {
      if (cancelled) return
      revealAt = performance.now() / 1000; ready = true; start()
    })
    // Passive listeners on the band only: never block touch scrolling
    const onMove = (e: PointerEvent) => {
      cx = e.clientX; cy = e.clientY
      if (!inside) {
        const r = root.getBoundingClientRect()
        px = lpx = dx = cx - r.left; py = lpy = dy = cy - r.top
        inside = true; settled = false; dot.style.opacity = '1'
      }
    }
    const onLeave = () => { inside = false; dot.style.opacity = '0' }
    root.addEventListener('pointermove', onMove, { passive: true })
    root.addEventListener('pointerleave', onLeave)
    return () => {
      cancelled = true
      stop(); ro.disconnect(); io.disconnect(); theme.disconnect(); offTier()
      root.removeEventListener('pointermove', onMove); root.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div ref={ref} className="hero__lines" aria-hidden="true">
      <canvas />
      <span className="hero__dot" />
    </div>
  )
}
