import { useEffect } from 'react'
import { initSmoothScroll, ScrollTrigger } from './lib/motion'
import { introDone, motionAllowed } from './lib/intro'
import { startWatchdog } from './lib/perf'
import { Header } from './components/Header'
import { Intro } from './components/Intro'
import { Hero } from './components/Hero'
import { About } from './components/About'
import { Ticker } from './components/Ticker'
import { Work } from './components/Work'
import { Personal } from './components/Personal'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { ScrollIndicator } from './components/ScrollIndicator'

export default function App() {
  useEffect(() => initSmoothScroll(), [])
  // Webfonts change layout; re-measure scroll triggers once, after fonts and the intro (nobody can scroll during it)
  useEffect(() => { Promise.all([document.fonts.ready, introDone]).then(() => ScrollTrigger.refresh()) }, [])
  // Drops the quality tier if scrolling keeps missing frames on this device
  useEffect(() => (motionAllowed() ? startWatchdog() : undefined), [])
  // QA overlay (FPS, dropped frames, tier): add ?hud to the URL. Separate chunk, never loaded otherwise.
  useEffect(() => { if (/[?&]hud/.test(location.search)) import('./lib/perf-hud').then((m) => m.mountHud()) }, [])

  return (
    <>
      <Intro />
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="frame" aria-hidden="true" />
      <ScrollIndicator />
      <div className="page">
        <Header />
        <main id="main">
          <Hero />
          <About />
          <Ticker seed={11} />
          <Work />
          <Ticker seed={23} reverse />
          <Personal />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  )
}
