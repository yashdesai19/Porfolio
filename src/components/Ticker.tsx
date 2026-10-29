import { useEffect, useRef } from 'react'
import { motionAllowed } from '../lib/intro'
import './ticker.css'

// What the strips spell out: the stack and focus areas from the approved content
const WORDS = ['PYTHON', 'FASTAPI', 'REACT', 'TYPESCRIPT', 'LLM APPS', 'RAG', 'APIS', 'DATABASES', 'SAAS', 'AI PRODUCTS', 'FULL-STACK', 'HYBENT']
const GROUPS = 6

/**
 * Ruled mono strip, static like the reference: keywords separated by blurred slash runs.
 * Every couple of seconds one keyword rolls up and is replaced by another.
 */
export function Ticker({ seed = 0, reverse = false }: { seed?: number; reverse?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!motionAllowed()) return
    const root = ref.current!
    const slots = [...root.querySelectorAll<HTMLElement>('.tk-word')]
    let visible = false, next = seed + GROUPS, timer = 0
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting })
    io.observe(root)

    const swap = () => {
      if (visible) {
        const slot = slots[(Math.random() * slots.length) | 0]
        const shown = new Set(slots.map((s) => s.textContent))
        let word = WORDS[next++ % WORDS.length]
        while (shown.has(word)) word = WORDS[next++ % WORDS.length] // never show the same word twice
        slot.classList.add('is-out')
        window.setTimeout(() => {
          slot.textContent = word
          slot.classList.remove('is-out')
          slot.classList.add('is-in')
          requestAnimationFrame(() => requestAnimationFrame(() => slot.classList.remove('is-in')))
        }, 450)
      }
      timer = window.setTimeout(swap, 1800 + Math.random() * 1400)
    }
    timer = window.setTimeout(swap, 1500 + (seed % 5) * 300)
    return () => { window.clearTimeout(timer); io.disconnect() }
  }, [seed])

  return (
    <div ref={ref} className={`ticker${reverse ? ' ticker--rev' : ''}`} aria-hidden="true">
      <span className="ticker__tri ticker__tri--l" />
      <span className="ticker__row">
        {Array.from({ length: GROUPS }, (_, gi) => (
          <span key={gi} className="ticker__set">
            <span className="ticker__word"><span className="tk-word">{WORDS[(seed + gi) % WORDS.length]}</span></span>
            {gi < GROUPS - 1 && <span className="ticker__slash" />}
          </span>
        ))}
      </span>
      <span className="ticker__tri ticker__tri--r" />
    </div>
  )
}
