import { useEffect, useRef, useState } from 'react'
import { site } from '../content/site'
import { motionAllowed } from '../lib/intro'
import { canvasDpr, pick } from '../lib/perf'
import './contact.css'

// Two words share one spot: the top line only shows above the midline, the bottom one below it
const LINES = ['Let’s', 'Rock'] as const
const SLICES = 4

/** Grid that bulges like a lens; hovering (or tapping) GO opens a circle where LET'S / ROCK bob through each other. */
export function Contact() {
  const ref = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(false)
  const lensRef = useRef<{ target: number; wake?: () => void }>({ target: 0 }) // lens strength target, read by the canvas loop

  // Canvas grid with lens distortion
  useEffect(() => {
    const section = ref.current!
    const canvas = section.querySelector('canvas')!
    const ctx2d = canvas.getContext('2d')!
    const animate = motionAllowed()
    let W = 0, H = 0, dpr = 1, raf = 0, visible = false
    let lx = 0, ly = 0, tx = 0, ty = 0, k = 0.5, kv = 0, sigma = 120, cell = 40, cellH = 28
    const color = () => getComputedStyle(section).getPropertyValue('--c-line').trim() || 'rgba(0,0,0,.2)'
    let stroke = color()

    const resize = () => {
      W = canvas.clientWidth; H = canvas.clientHeight
      dpr = canvasDpr(pick({ high: 2, mid: 1.5, low: 1 }), W, H)
      canvas.width = W * dpr; canvas.height = H * dpr
      // Lens sits on GO, which is centred below the space left for the headline spilling over from above
      const pad = parseFloat(getComputedStyle(section).paddingTop) || 0
      lx = tx = W / 2; ly = ty = pad + (H - pad) / 2
      cell = Math.max(40, W / 12); sigma = cell * 0.9
      stroke = color()
      paint()
    }
    const warp = (x: number, y: number): [number, number] => {
      const dx = x - lx, dy = y - ly
      const f = 1 + k * Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma))
      return [lx + dx * f, ly + dy * f]
    }
    const draw = () => {
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx2d.clearRect(0, 0, W, H)
      ctx2d.strokeStyle = stroke; ctx2d.lineWidth = 1
      // 12 columns from the left edge, rows .48 of a column (same cells as the floor above).
      // Lines run straight from vertex to vertex, so the lens reads as a faceted mesh like the reference.
      cell = Math.max(40, W / 12); cellH = Math.max(28, cell * 0.48)
      ctx2d.beginPath()
      for (let x = 0; x <= W + 1; x += cell) {
        for (let y = 0; y <= H + cellH; y += cellH) { const [a, b] = warp(x, Math.min(y, H)); if (y === 0) ctx2d.moveTo(a, b); else ctx2d.lineTo(a, b) }
      }
      for (let y = 0; y <= H + 1; y += cellH) {
        for (let x = 0; x <= W + cell; x += cell) { const [a, b] = warp(Math.min(x, W), y); if (x === 0) ctx2d.moveTo(a, b); else ctx2d.lineTo(a, b) }
      }
      ctx2d.stroke()
    }
    // Runs only while the lens is moving: once it settles the loop stops (0 frames at rest) until
    // GO opens/closes, the size or theme changes, or the grid scrolls back into view
    let last = 0
    const loop = (now: number) => {
      const f = last ? Math.min(4, (now - last) / 16.667) : 1 // frames' worth of time at 60 fps
      last = now
      const a = 1 - Math.pow(0.9, f)
      lx += (tx - lx) * a; ly += (ty - ly) * a
      // Spring toward the target, so the mesh overshoots and wobbles as it settles (60 Hz steps)
      const open = lensRef.current.target, kT = 0.35 + open * 1.05, sT = cell * 0.9 + open * Math.min(W, H) * 0.45
      for (let i = Math.max(1, Math.round(f)); i > 0; i--) { kv = (kv + (kT - k) * 0.025) * 0.9; k += kv }
      sigma += (sT - sigma) * (1 - Math.pow(1 - 0.035, f))
      draw()
      const settled = Math.abs(kv) < 1e-4 && Math.abs(kT - k) < 1e-3 && Math.abs(sT - sigma) < 0.5 && Math.abs(tx - lx) < 0.1 && Math.abs(ty - ly) < 0.1
      raf = settled ? 0 : requestAnimationFrame(loop)
    }
    const start = () => { if (!raf && visible && animate) { last = 0; raf = requestAnimationFrame(loop) } }
    const stop = () => { cancelAnimationFrame(raf); raf = 0 }
    // Static (reduced motion) draws right away; animated draws on its first visible frame
    const paint = () => { if (animate) start(); else draw() }
    const lens = lensRef.current
    lens.wake = start

    resize()
    const ro = new ResizeObserver(() => requestAnimationFrame(resize)); ro.observe(canvas) // next frame: no observer loop
    const theme = new MutationObserver(() => { stroke = color(); paint() })
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    if (!animate) return () => { ro.disconnect(); theme.disconnect() }

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); else stop() })
    io.observe(canvas)
    // The lens stays centred on GO, like the reference; only opening the circle changes its strength
    return () => { stop(); ro.disconnect(); io.disconnect(); theme.disconnect(); lens.wake = undefined }
  }, [])

  useEffect(() => { lensRef.current.target = open ? 1 : 0; lensRef.current.wake?.() }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); ref.current!.querySelector<HTMLElement>('.contact__go')?.focus() }
    }
    // A tap or click outside GO / the circle closes it too (phones have no pointer-leave)
    const onDown = (e: PointerEvent) => {
      if (!ref.current!.querySelector('.contact__hover')!.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onDown) }
  }, [open])

  return (
    <>
    <section id="contact" ref={ref} className="section contact" aria-labelledby="contact-h" data-open={open || undefined}>
      <canvas className="contact__grid" aria-hidden="true" />
      <h2 id="contact-h" className="sr-only">Contact</h2>
      <div
        className="contact__hover"
        onPointerEnter={(e) => { if (e.pointerType === 'mouse') setOpen(true) }}
        onPointerLeave={(e) => { if (e.pointerType === 'mouse') setOpen(false) }}
      >
        <button type="button" className="contact__go" aria-expanded={open} aria-controls="contact-reveal" onClick={() => setOpen((o) => !o)}>
          <span className="go__inner" aria-hidden="true" />
          <span className="go__text" aria-hidden="true">GO</span>
          <span className="sr-only">GO: show contact details</span>
        </button>
        <span className="contact__hint" aria-hidden="true"><span className="contact__hint-mouse">Hover me ↑</span><span className="contact__hint-touch">Tap me ↑</span></span>
        {/* Touch: once open, the circle covers GO, so a tap on it (anywhere but the email link) closes it */}
        <div id="contact-reveal" className="contact__cta" onClick={(e) => { if (!(e.target as HTMLElement).closest('a')) setOpen(false) }}>
          <span className="contact__dots" aria-hidden="true" />
          <span className="contact__stars" aria-hidden="true">
            {Array.from({ length: 4 }, (_, i) => (
              <svg key={i} className="contact__star" viewBox="0 0 24 24"><path d="M12 0c.7 6.6 4.9 10.9 12 12-7.1 1.1-11.3 5.4-12 12-.7-6.6-4.9-10.9-12-12 7.1-1.1 11.3-5.4 12-12Z" /></svg>
            ))}
          </span>
          <p className="sr-only">Let’s rock</p>
          {LINES.map((word, li) => (
            <div key={word} className={`cta__line cta__line--${li ? 'bottom' : 'top'}`} aria-hidden="true">
              <div className="cta__text">
                {[...word].map((ch, ci) => (
                  <span key={ci} className="cta__char" style={{ '--delay': `${(ci + 1) * 0.1}s` } as React.CSSProperties}>
                    {Array.from({ length: SLICES }, (_, l) => (
                      <span key={l} className="cta__slice">{ch === '’' ? <span className="cta__sup">’</span> : ch}</span>
                    ))}
                  </span>
                ))}
              </div>
            </div>
          ))}
          <a className="contact__mail" href={`mailto:${site.contact.email}`} tabIndex={open ? 0 : -1}>{site.contact.email}</a>
        </div>
      </div>
    </section>
    <ContactInfo />
    </>
  )
}

const TOPICS = ['AI product', 'Backend / API', 'Web app', 'Something else']
// Web3Forms access key (free, delivers to the inbox it was created for). Without it, Send opens the visitor's mail app.
const FORM_KEY = import.meta.env.VITE_WEB3FORMS_KEY as string | undefined

/** "Letter" form: the visitor fills the blanks of one sentence; sends via Web3Forms, or falls back to a prefilled email. */
function ContactInfo() {
  const [copied, setCopied] = useState(false)
  const [topics, setTopics] = useState<string[]>([])
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const copy = async () => {
    try { await navigator.clipboard.writeText(site.contact.email); setCopied(true); window.setTimeout(() => setCopied(false), 1800) }
    catch { window.location.href = `mailto:${site.contact.email}` }
  }
  const toggle = (t: string) => setTopics((a) => (a.includes(t) ? a.filter((x) => x !== t) : [...a, t]))

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    if (f.get('botcheck')) return // honeypot
    const name = String(f.get('name') || '').trim(), from = String(f.get('email') || '').trim(), idea = String(f.get('idea') || '').trim()
    const what = topics.length ? topics.join(', ') : 'something'
    const body = `NEW PROJECT INQUIRY\n\n${idea}\n\nPROJECT\n${what}\n\nFROM\n${name} <${from}>\n\nYASH DESAI / PORTFOLIO`
    if (!FORM_KEY) {
      window.location.href = `mailto:${site.contact.email}?subject=${encodeURIComponent(`Portfolio inquiry — ${what} · ${name}`)}&body=${encodeURIComponent(body)}`
      setState('sent'); return
    }
    setState('sending')
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ access_key: FORM_KEY, subject: `Portfolio inquiry — ${what} · ${name}`, from_name: 'Yash Desai / Portfolio', name, email: from, replyto: from, topics: what, message: body }),
      })
      setState((await res.json()).success ? 'sent' : 'error')
    } catch { setState('error') }
  }

  return (
    <div className="cinfo" role="region" aria-label="Contact">
      <form className="cinfo__cell cletter" onSubmit={submit} data-state={state}>
        <p className="cinfo__kicker">Write to me</p>
        {state === 'sent' ? (
          <div className="cletter__done" role="status">
            <p className="cinfo__title"><span>Message</span><span>sent.</span></p>
            <p className="cletter__line">Thanks — I’ll get back to you soon.</p>
            <button type="button" className="cinfo__copy" onClick={() => { setState('idle'); setTopics([]) }}>Write another</button>
          </div>
        ) : (
          <>
            <p className="cletter__line">
              Hi Yash, my name is{' '}
              <label className="cletter__blank"><span className="sr-only">Your name</span><input name="name" required autoComplete="name" placeholder="your name" size={10} /></label>
              {' '}and I want to build
            </p>
            <div className="cletter__chips" role="group" aria-label="What you want to build">
              {TOPICS.map((t) => (
                <button key={t} type="button" className="cletter__chip" aria-pressed={topics.includes(t)} onClick={() => toggle(t)}>{t}</button>
              ))}
            </div>
            <p className="cletter__line">
              Here’s the idea:{' '}
              <label className="cletter__blank cletter__blank--wide"><span className="sr-only">Your idea</span><textarea name="idea" required rows={2} placeholder="a few lines about it" /></label>
            </p>
            <p className="cletter__line">
              You can reach me at{' '}
              <label className="cletter__blank"><span className="sr-only">Your email</span><input name="email" type="email" required autoComplete="email" placeholder="you@email.com" size={14} /></label>.
            </p>
            <input type="text" name="botcheck" className="sr-only" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <div className="cletter__foot">
              <button type="submit" className="cletter__send" disabled={state === 'sending'}>
                <span>{state === 'sending' ? 'Sending…' : 'Send'}</span><span aria-hidden="true">↗</span>
              </button>
              {state === 'error' && <p className="cletter__err" role="alert">Couldn’t send — please email me directly.</p>}
            </div>
          </>
        )}
      </form>
      <div className="cinfo__cell">
        <p className="cinfo__kicker">Email</p>
        <a className="cinfo__mail" href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
        <button type="button" className="cinfo__copy" onClick={copy} aria-live="polite">{copied ? 'Copied ✓' : 'Copy email'}</button>
        <p className="cinfo__kicker cinfo__kicker--gap">Elsewhere</p>
        <ul className="cinfo__links">
          {site.contact.socials.map((s) => (
            <li key={s.label}><a href={s.href} target="_blank" rel="noreferrer">{s.label}<span aria-hidden="true">↗</span></a></li>
          ))}
        </ul>
        <p className="cinfo__where">{site.location} · {site.availability}</p>
      </div>
    </div>
  )
}
