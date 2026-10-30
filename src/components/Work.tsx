import { useEffect, useRef } from 'react'
import { site, type Project } from '../content/site'
import { gsap, getLenis, ScrollTrigger } from '../lib/motion'
import { motionAllowed } from '../lib/intro'
import { getTier, onTierChange, saveData } from '../lib/perf'
import { Scene } from './WorkScenes'
import './work.css'

const projects = site.projects.filter((p) => p.published)
const pad = (n: number) => String(n).padStart(2, '0')

// Every project appears exactly twice: the whole list in order (HYBENT first), then the whole list again.
// The second pass uses a project's second clip when it has one.
const ROUNDS = 2
const cards = Array.from({ length: ROUNDS }, (_, k) => projects.filter((p) => p.clips.length).map((p) => ({ p, clip: p.clips[k] ?? p.clips[0], k }))).flat()
const total = cards.length

const WORD = ['W', 'O', 'R', 'K']
const PER_ROW = 20 // letters rendered per row; only as many as fit are used
const ROW_Y = [-0.6, -0.2, 0.2, 0.6] // row offsets used for the bowing at the edges
// Per-card size and vertical offset (deterministic), like the reference's varied stream
const SIZES = [0.96, 0.78, 0.88, 0.74, 0.94, 0.8, 1, 0.76, 0.86, 0.92, 0.8, 0.95]
const OFFS = [0.65, -0.95, 0.55, -0.5, 0.9, -0.2, 0.3, -0.75, 0.8, -0.4, 0.1, -0.85]

// Like the reference: half a screen of scroll per card (+ the sticky stage itself)
const TRACK_VH = Math.max(3, total * 0.5 + 1)
const isFront = (r: number, i: number) => (r === 0 || r === 3) && i % 5 === 2 // a few top/bottom-row letters sit above the cards (z-index)

// GSAP's SlowMo(0.15, 0.6), as the reference uses for cards: quick in, a long slow glide through the middle, quick out
const slowMo = (lr: number, pw: number) => {
  const p1 = (1 - lr) / 2, p3 = p1 + lr
  return (t: number) => {
    const r = t + (0.5 - t) * pw
    if (t < p1) { const q = 1 - t / p1; return r - q * q * q * q * r }
    if (t > p3) { const q = (t - p3) / p1; return r + (t - r) * q * q * q * q }
    return r
  }
}
const cardEase = slowMo(0.15, 0.6)

/** Designed stand-in for a missing clip: an abstract product-preview surface, clearly labelled. */
function Placeholder({ p, k }: { p: Project; k: number }) {
  return (
    <div className={`ph ph--${p.id} ph--v${k % 4}`} role="img" aria-label={`${p.title}: preview placeholder`}>
      <div className="ph__bar"><i /><i /><i /><span>{p.code}</span><span>Preview soon</span></div>
      <div className="ph__body" aria-hidden="true">
        {k % 4 === 0 && <><b className="ph__title">{p.title}</b><span className="ph__line" /><span className="ph__line ph__line--s" /></>}
        {k % 4 === 1 && <span className="ph__grid">{Array.from({ length: 6 }, (_, i) => <span key={i} />)}</span>}
        {k % 4 === 2 && <span className="ph__bars">{[0.4, 0.7, 0.55, 0.9, 0.65, 0.8, 0.5].map((h, i) => <span key={i} style={{ height: `${h * 100}%` }} />)}</span>}
        {k % 4 === 3 && <><span className="ph__phone"><span /></span><span className="ph__rows"><span /><span /><span /></span></>}
      </div>
    </div>
  )
}

/**
 * Pinned stage, rebuilt on the reference's model:
 * - a pill-shaped hole in the page grows uniformly until the dark stage fills the screen;
 * - W/O/R/K letters sit on four conveyor rows that drift right-to-left, bowing and turning
 *   at the edges; with the stage "closed" every letter collapses onto the centre column;
 * - project cards slide across from right to left in the middle band, turning as they pass.
 * All positions are computed from one smoothed scroll value; no React state per frame.
 */
export function Work() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!motionAllowed()) return
    const section = ref.current!
    const track = section.querySelector<HTMLElement>('.work__track')!
    const stage = section.querySelector<HTMLElement>('.work__stage')!
    const win = section.querySelector<HTMLElement>('.work__window')!
    const ring = section.querySelector<HTMLElement>('.work__ring')!
    const scene = section.querySelector<HTMLElement>('.work__scene')!
    const letters = [...section.querySelectorAll<HTMLElement>('.wall__letter')]
    const cardEls = [...section.querySelectorAll<HTMLElement>('.wcard')]
    const videos = cardEls.map((c) => c.querySelector('video'))
    const counter = section.querySelector('.work__current')!
    section.classList.add('is-stage')

    let W = 0, H = 0, stickTop = 0, trackTop = 0, trackHeight = 0, stageHeight = 0, shift = 0, pillW = 0, pillH = 0, lw = 0, lh = 0, maxScale = 1, speed = 1
    // Everything render() needs is read here, never per frame (no layout reads in the scroll path)
    const letterI = letters.map((el) => Number(el.dataset.i)), letterR = letters.map((el) => Number(el.dataset.r))
    const lastHead = new Float32Array(letters.length).fill(NaN)
    const hidden = letters.map(() => false)
    const cardOn = cardEls.map(() => false)
    // Each row drifts at its own speed, as in the reference
    const FREQ = [1.35, 1.8, 1.15, 1.6]
    let n = PER_ROW, cw: number[] = [], ch: number[] = [], useSm = false, small = false
    let dynExtrude = getTier() === 'high'
    // Values tweened by the timeline (scrubbed by scroll)
    const st = { hole: 0, scene: 0.75, state: 0, anim: 0 }
    const cp = cardEls.map(() => ({ p: 1 })) // +1 off right … −1 off left

    const measureTrack = () => {
      trackTop = track.getBoundingClientRect().top + window.scrollY
      trackHeight = track.offsetHeight
      stageHeight = stage.offsetHeight
    }

    const measure = () => {
      W = stage.clientWidth; H = stage.clientHeight
      pillW = Math.min(W * (W > H ? 1 / 6 : W > 600 ? 1 / 3 : 1 / 2), 314); pillH = H * 0.8
      // scale at which the pill's rounded rect covers the whole stage
      maxScale = Math.max(W / pillW, H / (pillH - pillW)) * 1.15
      // the outline is sized from the same numbers, so it always hugs the hole (CSS viewport units drift on phones)
      ring.style.width = `${pillW + 24}px`; ring.style.height = `${pillH + 24}px`
      lw = letters[0].offsetWidth; lh = letters[0].offsetHeight
      stickTop = parseFloat(getComputedStyle(stage).top) || 0
      measureTrack()
      small = W <= 576 || (W <= 767 && W > H)
      // Copies per row, as in the reference: enough to keep the loop full across the screen
      // (our glyphs are wider than the reference font, so a few more copies keep the same density)
      n = Math.min(PER_ROW, Math.round((W / lw) * (W > 767 ? 1.1 : 0.75)) + 2)
      letters.forEach((el, k) => { el.style.display = letterI[k] < n ? '' : 'none'; el.style.visibility = '' })
      hidden.fill(false)
      cw = cardEls.map((c) => c.offsetWidth); ch = cardEls.map((c) => c.offsetHeight)
      useSm = getTier() !== 'high' || window.innerWidth < 900
      speed = Math.hypot(W, H) * 4
    }

    let front = -1
    const render = () => {
      const { state, anim } = st
      // Pill hole in the page grows until the dark stage fills the screen
      const s = 1 + (maxScale - 1) * st.hole
      const w = pillW * s, h = pillH * s, r = (pillW * s) / 2
      win.style.clipPath = `inset(${((H - h) / 2).toFixed(1)}px ${((W - w) / 2).toFixed(1)}px round ${r.toFixed(1)}px)`
      ring.style.transform = `translate(-50%, -50%) scale(${s.toFixed(4)})`
      ring.style.opacity = String(1 - st.hole)
      scene.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0) scale(${st.scene.toFixed(4)})`
      // the dots drift left with the letters
      win.style.setProperty('--dot-shift', `${((-anim * 0.05) % 22).toFixed(1)}px`)

      // Letters: each row is a loop of copies; at state 0 they all sit on the centre column (the WORK title)
      for (let k = 0; k < letters.length; k++) {
        const i = letterI[k]
        if (i >= n) continue
        const el = letters[k], row = letterR[k], L = speed * FREQ[row]
        const prog = (((anim % L) / L + i / n) % 1) / 0.7 - 0.15
        const head = (prog - 0.5) * -2 // +1.3 right … −1.3 left
        const x = head * (W / 2) * state
        // Off-screen letters are hidden once and skipped until they come back
        const off = Math.abs(x) > W / 2 + lw
        if (off !== hidden[k]) {
          hidden[k] = off
          el.style.visibility = off ? 'hidden' : ''
          el.style.willChange = off ? 'auto' : 'transform'
        }
        if (off) continue
        const yy = ROW_Y[row] * lh * 0.5 * head * head * state
        const rot = (-10 * head * state).toFixed(2)
        el.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${yy.toFixed(1)}px, 0) rotateY(${rot}deg)`
        if (dynExtrude) {
          const hq = Math.round(head * state * state * 20) / 20
          if (hq !== lastHead[k]) { lastHead[k] = hq; el.style.setProperty('--head', String(hq)) }
        }
      }

      // Cards glide right → left, slowing through the middle.
      // One clip plays at a time (the card nearest the centre): a second decoding video halved the frame
      // rate in testing (60 → 30 fps). The others hold their poster / last frame. Save-Data: posters only.
      const maxPlay = saveData() ? 0 : 1
      let nearest = -1, best = 9
      for (let i = 0; i < cardEls.length; i++) {
        const aP = Math.abs(cp[i].p)
        if (aP < 1 && aP < best) { best = aP; nearest = i }
      }
      for (let i = 0; i < cardEls.length; i++) {
        const card = cardEls[i], P = cp[i].p, aP = Math.abs(P)
        const on = aP < 1
        // data-on also un-pauses the card's animated preview
        if (on !== cardOn[i]) {
          cardOn[i] = on
          card.style.visibility = on ? 'visible' : 'hidden'
          card.style.willChange = on ? 'transform' : 'auto'
          card.toggleAttribute('data-on', on)
        }
        card.toggleAttribute('data-active', on && aP < 0.4)
        const v = videos[i]
        if (v) {
          const play = on && i === nearest && maxPlay > 0
          // src only when this card is the one to play: until then the poster shows (a loaded, never-played
          // clip would show its first frame instead, often black)
          if (play) {
            if (!v.hasAttribute('src') && v.dataset.src) v.src = (useSm && v.dataset.srcSm) || v.dataset.src
            if (v.paused) v.play().catch(() => { /* autoplay refused: poster stays */ })
          } else if (on && v.hasAttribute('src')) {
            v.pause()
          } else if (!on && v.hasAttribute('src')) {
            v.pause()
            v.removeAttribute('src')
            v.load()
          }
        }
        if (!on) continue
        const size = W <= 987 ? 1 : SIZES[i % SIZES.length]
        const oy = OFFS[i % OFFS.length] * ch[i] * (small ? 1 : 0.5)
        card.style.transform = `translate(-50%, -50%) rotateY(${(-20 * P).toFixed(2)}deg) translate3d(${(P * (W / 2 + cw[i] * size)).toFixed(1)}px, ${oy.toFixed(1)}px, ${(-P * P * 80).toFixed(1)}px) scale(${size})`
      }
      if (nearest >= 0 && nearest !== front) { front = nearest; counter.textContent = pad(nearest + 1) }
    }

    // The reference's timeline: open (hole, scene, letters fan out) → cards one by one → close; all scrubbed by scroll
    let tl: gsap.core.Timeline | null = null
    let renderFrame = 0
    const scheduleRender = () => {
      if (renderFrame) return
      renderFrame = window.requestAnimationFrame(() => { renderFrame = 0; render() })
    }
    const build = () => {
      const prev = tl?.progress() ?? 0
      tl?.scrollTrigger?.kill(); tl?.kill()
      tl = gsap.timeline({
        onUpdate: scheduleRender,
        scrollTrigger: {
          trigger: track, start: 'top 25%', end: 'bottom 75%', scrub: 1,
          onLeave: () => videos.forEach((v) => v?.pause()),
          onLeaveBack: () => videos.forEach((v) => v?.pause()),
        },
      })
      tl.fromTo(st, { hole: 0 }, { hole: 1, duration: 0.75, ease: 'power4.in' }, 0)
        .fromTo(st, { scene: 0.75 }, { scene: 1, duration: 0.75, ease: 'power3.in' }, 0)
        .fromTo(st, { state: 0 }, { state: 1, duration: 0.75, ease: 'power4.in' }, 0)
      cp.forEach((c, i) => tl!.fromTo(c, { p: 1 }, { p: -1, duration: 0.5, ease: cardEase }, 0.75 + i * 0.25))
      tl.fromTo(st, { anim: 0 }, { anim: 10000, duration: tl.totalDuration(), ease: 'power1.out' }, 0.75)
        .fromTo(st, { state: 1 }, { state: 0, duration: 0.75, ease: 'power4.inOut', immediateRender: false }, '-=1')
        .fromTo(st, { hole: 1 }, { hole: 0, duration: 0.75, ease: 'power4.inOut', immediateRender: false }, '<')
        .fromTo(st, { scene: 1 }, { scene: 0.75, duration: 0.75, ease: 'power3.inOut', immediateRender: false }, '<')
      tl.progress(prev)
      render()
    }
    measure(); build()
    // Like the reference, the hole moves with the page while what is inside it stays put: until the stage sticks
    // (and again once it lets go) the scene is shifted back by however far the stage is from its stuck position.
    const pin = ScrollTrigger.create({
      trigger: track, start: 'top bottom', end: 'bottom top',
      onRefresh: measureTrack,
      onUpdate: (trigger) => {
        const scrollY = trigger.scroll()
        const normalTop = trackTop - scrollY
        const stickyEndTop = trackTop + trackHeight - stageHeight - scrollY
        const stageTop = Math.min(Math.max(normalTop, stickTop), stickyEndTop)
        const next = stickTop - stageTop
        if (Math.abs(next - shift) < 0.5) return
        shift = next; scheduleRender()
      },
    })
    // Like the reference: re-measure and rebuild on resize (widths, pill and letter copies all change)
    // Phones fire resize whenever the address bar shows or hides: only a width change needs a rebuild
    let rt = 0, lastW = window.innerWidth
    const onResize = () => {
      if (window.innerWidth === lastW) return
      lastW = window.innerWidth
      clearTimeout(rt); rt = window.setTimeout(() => { measure(); build() }, 150)
    }
    window.addEventListener('resize', onResize)
    const offTier = onTierChange((t) => {
      dynExtrude = t === 'high'
      if (!dynExtrude) letters.forEach((el) => el.style.removeProperty('--head'))
      lastHead.fill(NaN); measure(); render()
    })
    // Keyboard: focusing a card scrolls to the moment that card is centre-stage
    const onFocus = (e: FocusEvent) => {
      const i = cardEls.findIndex((c) => c.contains(e.target as Node))
      const t = tl?.scrollTrigger
      if (i < 0 || !tl || !t) return
      const target = t.start + ((0.75 + i * 0.25 + 0.25) / tl.duration()) * (t.end - t.start)
      const lenis = getLenis()
      if (lenis) lenis.scrollTo(target, { immediate: true })
      else window.scrollTo(0, target)
    }
    section.addEventListener('focusin', onFocus)

    return () => {
      section.removeEventListener('focusin', onFocus); offTier()
      window.removeEventListener('resize', onResize); clearTimeout(rt)
      if (renderFrame) window.cancelAnimationFrame(renderFrame)
      pin.kill(); tl?.scrollTrigger?.kill(); tl?.kill()
      section.classList.remove('is-stage')
      videos.forEach((v) => {
        if (!v) return
        v.pause()
        if (v.hasAttribute('src')) { v.removeAttribute('src'); v.load() }
      })
      ;[win, ring, scene, ...letters, ...cardEls].forEach((el) => el.removeAttribute('style'))
    }
  }, [])

  // Posters load only when the section is about a screen away (not needed for the first paint)
  useEffect(() => {
    const section = ref.current!
    const vids = [...section.querySelectorAll<HTMLVideoElement>('video[data-poster]')]
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      vids.forEach((v) => { v.poster = v.dataset.poster! })
      io.disconnect()
    }, { rootMargin: '100% 0px' })
    io.observe(section)
    return () => io.disconnect()
  }, [])

  return (
    <section id="work" ref={ref} className="section work" aria-labelledby="work-h" style={{ '--track': TRACK_VH } as React.CSSProperties}>
      <h2 id="work-h" className="work__heading display">Work</h2>
      <div className="work__track">
        <div className="work__stage">
          <div className="work__window">
            <div className="work__scene">
              <div className="work__wall" aria-hidden="true">
                {WORD.map((ch, r) => (
                  <div key={ch} className="wall__row" style={{ '--row': r } as React.CSSProperties}>
                    {Array.from({ length: PER_ROW }, (_, i) => <span key={i} className="wall__letter" data-i={i} data-r={r} data-letter={ch} data-front={isFront(r, i) || undefined}>{ch}</span>)}
                  </div>
                ))}
              </div>
              <ol className="work__list">
                {cards.map(({ p, clip, k }, i) => (
                  <li
                    key={`${p.id}-${k}`}
                    className="wcard"
                    tabIndex={p.url ? undefined : 0}
                    aria-label={p.url ? undefined : `${p.title}: ${p.tagline}`}
                  >
                    <div className={`wcard__media${p.backdrop ? ' wcard__media--backdrop' : ''}`}>
                      {clip.video
                        ? <video data-src={clip.video} data-src-sm={clip.videoSm} data-poster={clip.poster} muted loop playsInline preload="none" aria-label={`${p.title} preview`} />
                        : clip.scene ? <Scene id={clip.scene} /> : <Placeholder p={p} k={k} />}
                    </div>
                    <div className="wcard__label">
                      <h3 className="wcard__title">{p.url ? <a href={p.url}>{p.title}</a> : p.title}</h3>
                      <span className="wcard__code">{p.concept ? 'Concept · ' : ''}#{p.code}-{String(i + 1).padStart(4, '0')}/{pad(total)}</span>
                    </div>
                    <p className="wcard__tagline">{p.tagline}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <div className="work__ring" aria-hidden="true" />
          <p className="work__count" aria-hidden="true">
            Work <span className="work__current">01</span> / {pad(total)}
          </p>
        </div>
      </div>
    </section>
  )
}
