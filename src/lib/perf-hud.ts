// QA overlay, loaded only with ?hud: FPS, dropped frames while scrolling, tier, long tasks.
import { getTier, isScrolling } from './perf'

export function mountHud() {
  const el = document.createElement('div')
  el.setAttribute('aria-hidden', 'true')
  el.style.cssText = 'position:fixed;z-index:9999;left:24px;bottom:24px;padding:6px 8px;background:#000c;color:#0f0;font:11px/1.35 monospace;white-space:pre;pointer-events:none;border-radius:4px'
  document.body.appendChild(el)

  let longTasks = 0
  try {
    new PerformanceObserver((l) => { longTasks += l.getEntries().length }).observe({ type: 'longtask', buffered: true })
  } catch { /* longtask not supported (Safari/Firefox) */ }

  let frames = 0, scrollFrames = 0, dropped = 0, last = performance.now(), prev = last, base = 1000 / 60
  const loop = (now: number) => {
    const dt = now - prev
    prev = now
    frames++
    if (!isScrolling()) base = base * 0.98 + Math.min(dt, 50) * 0.02 // tracks the idle interval
    else { scrollFrames++; if (dt > base * 1.7) dropped++ }
    if (now - last >= 1000) {
      const fps = Math.round((frames * 1000) / (now - last))
      const drop = scrollFrames ? Math.round((dropped / scrollFrames) * 100) : 0
      el.textContent = `${fps} fps\nscroll drop ${drop}%\ntier ${getTier()}\nlong tasks ${longTasks}`
      frames = scrollFrames = dropped = 0
      last = now
    }
    requestAnimationFrame(loop)
  }
  requestAnimationFrame(loop)
}
