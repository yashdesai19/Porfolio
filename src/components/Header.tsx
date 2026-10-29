import { useEffect, useRef, useState } from 'react'
import { site } from '../content/site'
import { gsap, getLenis } from '../lib/motion'
import { introDone, motionAllowed } from '../lib/intro'
import { Logo } from './ui/Logo'
import './header.css'

const CONSOLE_LINES = 4

/** Simple original glyphs for the profile links */
function SocialIcon({ name }: { name: string }) {
  if (name === 'LinkedIn') return <span className="social-glyph" aria-hidden="true">in</span>
  return (
    <svg className="social-glyph" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 7 3 12l5 5M16 7l5 5-5 5M14 4l-4 16" />
    </svg>
  )
}

const nav = [
  { href: '#about', label: 'About' },
  { href: '#work', label: 'Work' },
  { href: '#contact', label: 'Contact' },
]

export function Header() {
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const [current, setCurrent] = useState('')

  // The section in the middle of the screen marks its nav link (▸ stays on)
  useEffect(() => {
    const els = nav.map((n) => document.querySelector<HTMLElement>(n.href)).filter((e): e is HTMLElement => !!e)
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setCurrent(`#${e.target.id}`) })
    }, { rootMargin: '-50% 0px -50% 0px' })
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [])

  // Entrance: header items drop into place after the intro
  useEffect(() => {
    if (!motionAllowed()) return
    let cancelled = false
    let tween: gsap.core.Tween | undefined
    introDone.then(() => {
      if (cancelled) return
      tween = gsap.fromTo(headerRef.current!.querySelectorAll('.reveal'),
        { autoAlpha: 0, yPercent: -120 },
        { autoAlpha: 1, yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.06, delay: 0.1 })
    })
    return () => { cancelled = true; tween?.revert() }
  }, [])

  // Rolling console: every tick the top line leaves and the next message is appended
  useEffect(() => {
    if (!motionAllowed()) return
    const list = headerRef.current!.querySelector('.console')!
    const lines = site.header.console
    let next = CONSOLE_LINES, id = 0, cancelled = false
    const tick = () => {
      list.firstElementChild?.remove()
      const li = document.createElement('li')
      li.textContent = lines[next++ % lines.length]
      list.appendChild(li)
    }
    // Runs only while the header is on screen, and not under the intro
    const io = new IntersectionObserver(([e]) => {
      window.clearInterval(id); id = 0
      if (e.isIntersecting) id = window.setInterval(tick, 1400)
    })
    introDone.then(() => { if (!cancelled) io.observe(headerRef.current!) })
    return () => { cancelled = true; window.clearInterval(id); io.disconnect() }
  }, [])

  useEffect(() => {
    if (!open) return
    panelRef.current?.querySelector<HTMLElement>('a')?.focus()
    // Lock scroll and keep Tab inside the header while the menu covers the page
    const behind = document.querySelectorAll<HTMLElement>('main, footer')
    behind.forEach((el) => (el.inert = true))
    document.documentElement.style.overflow = 'hidden'
    getLenis()?.stop()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
        return
      }
      if (e.key === 'Tab') {
        const links = panelRef.current?.querySelectorAll<HTMLElement>('a[href]')
        const first = links?.[0]
        const last = links?.[links.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }
    const onResize = () => window.innerWidth > 640 && setOpen(false)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      behind.forEach((el) => (el.inert = false))
      document.documentElement.style.overflow = ''
      getLenis()?.start()
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  const links = nav.map((n) => (
    <li key={n.href}>
      <a href={n.href} onClick={() => setOpen(false)}>{n.label}</a>
    </li>
  ))

  return (
    <header ref={headerRef} className="header" data-menu={open ? 'open' : 'closed'}>
      <a href="#top" className="hcell header__logo" aria-label={`${site.name}, home`}>
        <Logo className="header__mark" />
      </a>
      <div className="hcell header__tag">
        <span className="sr-only">{site.name}, {site.header.tag}</span>
        <ol className="console" aria-hidden="true">
          {site.header.console.slice(0, CONSOLE_LINES).map((l, i) => <li key={i}>{l}</li>)}
        </ol>
      </div>
      <nav aria-label="Primary" className="hcell header__desktop">
        <ul className="header__nav">{nav.map((n) => <li key={n.href} className="reveal"><a href={n.href} aria-current={current === n.href ? 'location' : undefined}><span className="nav__text">{n.label}</span></a></li>)}</ul>
      </nav>
      <ul className="hcell header__socials" aria-label="Profiles">
        {site.contact.socials.map((s) => (
          <li key={s.label}><a href={s.href} aria-label={s.label} className="reveal"><SocialIcon name={s.label} /></a></li>
        ))}
      </ul>
      <div className="hcell header__lines">
        <p className="serif reveal">{site.header.lines[0]}</p>
        <p className="serif reveal">{site.header.lines[1]} <a href="#contact">→ {site.header.cta}</a></p>
      </div>
      <button
        ref={toggleRef}
        className="hcell header__burger"
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((o) => !o)}
      >
        <span aria-hidden="true" />
      </button>
      <div id="mobile-menu" ref={panelRef} className="header__panel" hidden={!open}>
        <nav aria-label="Mobile">
          <ul>{links}</ul>
        </nav>
        <p className="serif header__panel-lines">{site.header.lines[0]}<br />{site.header.lines[1]}</p>
      </div>
    </header>
  )
}
