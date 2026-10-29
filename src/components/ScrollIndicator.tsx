import { useEffect, useRef } from 'react'
import { getLenis } from '../lib/motion'
import './scroll-indicator.css'

/**
 * Custom scrollbar thumb inside the right-hand bar of the ink frame. DOM writes only, no React state.
 * Sizes are cached (ResizeObserver / resize); per scroll it only reads the scroll position.
 */
export function ScrollIndicator() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const track = ref.current!
    const thumb = track.firstElementChild as HTMLElement
    let raf = 0, doc = 1, view = 1, trackH = 1, h = 24
    const measure = () => {
      doc = document.documentElement.scrollHeight; view = window.innerHeight; trackH = track.clientHeight
      h = Math.max(24, (view / doc) * trackH)
      thumb.style.height = `${h}px`
      update()
    }
    const update = () => {
      raf = 0
      const y = getLenis()?.scroll ?? window.scrollY
      const p = doc > view ? Math.min(1, Math.max(0, y / (doc - view))) : 0
      thumb.style.transform = `translateY(${(p * (trackH - h)).toFixed(1)}px)`
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    const ro = new ResizeObserver(() => requestAnimationFrame(measure)) // next frame: no observer loop
    ro.observe(document.body)
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      cancelAnimationFrame(raf); ro.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', measure)
    }
  }, [])

  return (
    <div ref={ref} className="si" aria-hidden="true">
      <span className="si__thumb" />
    </div>
  )
}
