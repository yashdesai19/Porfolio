import type { CSSProperties, ReactNode } from 'react'
import './work-scenes.css'
import './work-concepts.css'
import './work-templates.css'

/*
 * Animated product previews for the Work cards (stand-ins until real recordings exist).
 * Every scene runs on one looping timeline, --t (0 → 1 over the loop), set by CSS on .sc.
 * Children read it: `.k` items appear at --at, `.f` fills grow from --at over --dur, `.n` counters count to --to.
 * Sample data only, labelled as such in the bar.
 */

type V = CSSProperties & Record<`--${string}`, string | number>
const at = (t: number, extra: V = {}): V => ({ '--at': t, ...extra })

/** A scene: a glowing stage in the project's colours, with the app window tilted in 3D, floating gently. */
function Frame({ kind, title, tag = 'Sample data', style, children }: { kind: string; title: string; tag?: string; style?: V; children: ReactNode }) {
  return (
    <div className={`sc sc--${kind}`} style={style} role="img" aria-label={`${title} (animated preview, ${tag.toLowerCase()})`}>
      <span className="sc__glow" aria-hidden="true" />
      <div className="sc__win">
        <div className="sc__bar" aria-hidden="true">
          <i /><i /><i /><span className="sc__title">{title}</span><span className="sc__tag">{tag}</span>
        </div>
        <div className="sc__body" aria-hidden="true">{children}</div>
      </div>
    </div>
  )
}

const Num = ({ to, from = 0, pre = '', post = '', a, d = 0.3 }: { to: number; from?: number; pre?: string; post?: string; a: number; d?: number }) => (
  <span className="n" data-pre={pre} data-post={post} style={at(a, { '--from': from, '--to': to, '--dur': d })} />
)

/* ---------------- HYBENT ---------------- */

function HybParse() {
  const skills = ['Python', 'FastAPI', 'PostgreSQL', 'AWS', 'Redis']
  return (
    <Frame kind="hyb" title="Resume parsing">
      <div className="hp">
        <div className="hp__doc">
          <span className="hp__avatar" />
          <span className="ln ln--h" /><span className="ln ln--s" />
          {Array.from({ length: 9 }, (_, i) => <span key={i} className={`ln ${i % 3 === 2 ? 'ln--s' : ''}`} />)}
          <span className="hp__scan" />
          <span className="hp__file">resume_aarav.pdf</span>
        </div>
        <div className="hp__arrow k" style={at(0.12)}>→</div>
        <div className="hp__out">
          <p className="sc__kicker k" style={at(0.16)}>AI extracted profile</p>
          <p className="hp__name k" style={at(0.22)}>Aarav Mehta</p>
          <p className="hp__role k" style={at(0.28)}>Senior Backend Engineer · 6 yrs</p>
          <div className="chips">{skills.map((s, i) => <span key={s} className="chip k" style={at(0.34 + i * 0.04)}>{s}</span>)}</div>
          <div className="hp__row k" style={at(0.58)}><span>Education</span><b>B.Tech, Computer Eng.</b></div>
          <div className="hp__row k" style={at(0.62)}><span>Location</span><b>Bengaluru · Open to remote</b></div>
          <div className="hp__done k" style={at(0.7)}>✓ Parsed in 1.8s</div>
        </div>
      </div>
    </Frame>
  )
}

function HybMatch() {
  const people = [
    { n: 'Aarav Mehta', s: 92 }, { n: 'Priya Nair', s: 81 }, { n: 'Rohan Shah', s: 67 },
  ]
  return (
    <Frame kind="hyb" title="Candidate matching">
      <div className="hm">
        <div className="hm__job">
          <p className="sc__kicker">Open role</p>
          <p className="hm__title">Backend Engineer</p>
          <p className="hm__meta">Remote · Full-time</p>
          <div className="chips">{['Python', 'FastAPI', 'SQL', 'Docker'].map((s) => <span key={s} className="chip chip--soft">{s}</span>)}</div>
          <div className="hm__ring f" style={at(0.2, { '--dur': 0.35, '--to': 0.92 })}>
            <span><Num to={92} a={0.2} d={0.35} post="%" /><small>best fit</small></span>
          </div>
        </div>
        <div className="hm__list">
          {people.map((p, i) => (
            <div key={p.n} className="hm__cand k" style={at(0.1 + i * 0.08)}>
              <span className="hm__av" style={{ '--h': 250 + i * 40 } as V} />
              <span className="hm__who"><b>{p.n}</b><span className="bar"><span className="f" style={at(0.18 + i * 0.08, { '--dur': 0.3, '--to': p.s / 100 })} /></span></span>
              <span className="hm__score"><Num to={p.s} a={0.18 + i * 0.08} post="%" /></span>
            </div>
          ))}
          <div className="hm__badge k" style={at(0.6)}>★ Shortlisted top match</div>
        </div>
      </div>
    </Frame>
  )
}

function HybCopilot() {
  return (
    <Frame kind="hyb" title="Recruiter copilot · RAG">
      <div className="hc">
        <div className="hc__q type" style={at(0.04, { '--dur': 0.18 })}>Who are the strongest candidates for the backend role?</div>
        <div className="hc__think k" style={at(0.24)}><span className="dots"><i /><i /><i /></span> Searching 1,284 resumes &amp; the job description</div>
        <div className="hc__src">
          {['resume_aarav.pdf', 'resume_priya.pdf', 'jd_backend.md'].map((s, i) => <span key={s} className="chip chip--src k" style={at(0.34 + i * 0.04)}>⧉ {s}</span>)}
        </div>
        <div className="hc__a">
          <span className="k" style={at(0.5)}><b>Aarav Mehta</b> — 6 yrs FastAPI + PostgreSQL, led a payments API.</span>
          <span className="k" style={at(0.58)}><b>Priya Nair</b> — strong Python, Docker and AWS; shipped 3 microservices.</span>
          <span className="k" style={at(0.66)}><b>Rohan Shah</b> — solid SQL; less backend depth.</span>
          <span className="hc__cite k" style={at(0.74)}>Grounded in 3 sources ✓</span>
        </div>
      </div>
    </Frame>
  )
}

function HybPipeline() {
  const cols = [['Applied', 48], ['Screening', 21], ['Interview', 9], ['Offer', 3]] as const
  return (
    <Frame kind="hyb" title="Hiring pipeline">
      <div className="hk">
        {cols.map(([c, n], i) => (
          <div key={c} className="hk__col">
            <p className="hk__head"><span>{c}</span><b>{n}</b></p>
            {Array.from({ length: 3 - Math.min(i, 2) }, (_, j) => <span key={j} className="hk__card"><i /><span className="ln" /><span className="ln ln--s" /></span>)}
          </div>
        ))}
        <span className="hk__mover"><i /><span><b>Aarav Mehta</b><small>Backend Engineer</small></span><em>92%</em></span>
        <span className="hk__toast k" style={at(0.8)}>🎉 Offer sent</span>
      </div>
    </Frame>
  )
}

/* ---------------- DHAN ---------------- */

const Phone = ({ children }: { children: ReactNode }) => (
  <div className="ph2"><span className="ph2__notch" /><div className="ph2__screen">{children}</div></div>
)

function DhnSpend() {
  const cats = [['Food', '#34d399', 40], ['Travel', '#60a5fa', 25], ['Shopping', '#fbbf24', 20], ['Bills', '#f472b6', 15]] as const
  return (
    <Frame kind="dhn" title="DHAN · Monthly spend">
      <div className="dz">
        <div className="dz__float dz__float--l k" style={at(0.45)}><small>Top category</small><b>Food · ₹9,940</b></div>
        <Phone>
          <p className="sc__kicker">October</p>
          <p className="dz__total">₹<Num to={24860} a={0.08} d={0.35} /></p>
          <p className="dz__sub">spent this month</p>
          <div className="dz__donut f" style={at(0.1, { '--dur': 0.4, '--to': 1 })}><span>4 categories</span></div>
          <div className="dz__legend">
            {cats.map(([c, col, p], i) => (
              <span key={c} className="k" style={at(0.35 + i * 0.05)}><i style={{ background: col }} />{c}<b>{p}%</b></span>
            ))}
          </div>
        </Phone>
        <div className="dz__float dz__float--r k" style={at(0.6)}><small>vs September</small><b className="good">↓ 12%</b></div>
      </div>
    </Frame>
  )
}

function DhnSplit() {
  const tx = [['☕', 'Blue Tokai', '− ₹420'], ['🚕', 'City Cab', '− ₹280'], ['🛒', 'Grocery Mart', '− ₹1,120'], ['🎬', 'Movie night', '− ₹900']]
  return (
    <Frame kind="dhn" title="DHAN · Shared expenses">
      <div className="dz">
        <Phone>
          <p className="sc__kicker">Recent</p>
          {tx.map(([i, n, a], k) => (
            <div key={n} className="dz__tx k" style={at(0.06 + k * 0.07)}><span className="dz__ic">{i}</span><span>{n}<small>Today</small></span><b>{a}</b></div>
          ))}
          <button className="dz__add k" style={at(0.4)} tabIndex={-1}>＋ Add expense</button>
        </Phone>
        <div className="dz__split k" style={at(0.48)}>
          <small>Goa trip · split 4 ways</small>
          <span className="dz__avs">{[200, 150, 30, 330].map((h) => <i key={h} style={{ '--h': h } as V} />)}</span>
          <p>You get back</p>
          <b className="good">₹<Num to={1250} a={0.55} d={0.25} /></b>
          <span className="dz__settle k" style={at(0.75)}>Settle up ✓</span>
        </div>
      </div>
    </Frame>
  )
}

function DhnBudget() {
  const b = [['Food', 0.62, '#34d399'], ['Travel', 0.38, '#60a5fa'], ['Shopping', 0.85, '#fb923c']] as const
  return (
    <Frame kind="dhn" title="DHAN · Budgets">
      <div className="dz">
        <Phone>
          <p className="sc__kicker">Budgets · October</p>
          {b.map(([c, v, col], i) => (
            <div key={c} className="dz__bud">
              <span>{c}<b><Num to={Math.round(v * 100)} a={0.1 + i * 0.08} post="%" /></b></span>
              <span className="bar"><span className="f" style={at(0.1 + i * 0.08, { '--dur': 0.35, '--to': v, background: col })} /></span>
            </div>
          ))}
          <p className="dz__left k" style={at(0.5)}>₹<Num to={6140} a={0.5} d={0.2} /> left to spend</p>
        </Phone>
        <div className="dz__toast k" style={at(0.62)}><span>⚠️</span><span><b>Shopping at 85%</b><small>₹1,200 left for 9 days</small></span></div>
      </div>
    </Frame>
  )
}

/* ---------------- Live cricket ---------------- */

function CrkLive() {
  const balls = [['1', ''], ['4', 'b4'], ['•', ''], ['6', 'b6'], ['W', 'bw'], ['2', '']]
  return (
    <Frame kind="crk" title="Live match centre">
      <div className="cl">
        <div className="cl__top"><span className="cl__live">● LIVE</span><span>T20 · Match 14</span></div>
        <div className="cl__score">
          <div><small>IND</small><b><Num from={138} to={152} a={0.05} d={0.75} /><span>/3</span></b><small>17.2 ov · CRR 8.76</small></div>
          <div className="cl__vs">vs</div>
          <div className="cl__opp"><small>AUS</small><b>182<span>/6</span></b><small>Need 31 off 16</small></div>
        </div>
        <p className="sc__kicker">This over</p>
        <div className="cl__balls">{balls.map(([b, c], i) => <span key={i} className={`k ${c}`} style={at(0.1 + i * 0.12)}>{b}</span>)}</div>
        <div className="cl__bat">
          <span><b>R. Sharma*</b> 64 (38)</span><span className="bar"><span className="f" style={at(0.1, { '--dur': 0.7, '--to': 0.72 })} /></span>
          <span><b>S. Iyer</b> 21 (15)</span><span className="bar"><span className="f" style={at(0.2, { '--dur': 0.6, '--to': 0.4 })} /></span>
        </div>
      </div>
    </Frame>
  )
}

function CrkWinProb() {
  return (
    <Frame kind="crk" title="Win probability">
      <div className="cw">
        <div className="cw__head">
          <span><small>IND</small><b className="lime"><Num from={50} to={64} a={0.1} d={0.7} post="%" /></b></span>
          <span className="cw__opp"><small>AUS</small><b><Num from={50} to={36} a={0.1} d={0.7} post="%" /></b></span>
        </div>
        <svg className="cw__chart" viewBox="0 0 400 160" preserveAspectRatio="none">
          {[40, 80, 120].map((y) => <line key={y} x1="0" x2="400" y1={y} y2={y} className="cw__grid" />)}
          <line x1="0" x2="400" y1="80" y2="80" className="cw__mid" />
          <path className="cw__area" d="M0 80 L40 70 L80 92 L120 84 L160 104 L200 76 L240 62 L280 88 L320 58 L360 50 L400 44 L400 160 L0 160 Z" />
          <path className="cw__line" pathLength={1} d="M0 80 L40 70 L80 92 L120 84 L160 104 L200 76 L240 62 L280 88 L320 58 L360 50 L400 44" />
          <circle className="cw__wk k" style={at(0.3)} cx="160" cy="104" r="5" />
          <circle className="cw__wk k" style={at(0.62)} cx="280" cy="88" r="5" />
        </svg>
        <div className="cw__axis"><span>Over 1</span><span>Over 10</span><span>Over 17</span></div>
        <p className="cw__note k" style={at(0.78)}>Model re-scores after every ball</p>
      </div>
    </Frame>
  )
}

function CrkWagon() {
  const shots = [[-40, 0.9, 'b4'], [-115, 0.7, ''], [20, 1, 'b6'], [70, 0.55, ''], [150, 0.95, 'b4'], [-160, 0.6, ''], [110, 1, 'b6'], [-70, 0.8, 'b4']] as const
  return (
    <Frame kind="crk" title="Wagon wheel">
      <div className="cg">
        <div className="cg__field">
          <span className="cg__inner" /><span className="cg__pitch" />
          {shots.map(([a, l, c], i) => (
            <span key={i} className={`cg__shot ${c}`} style={{ '--a': `${a}deg`, '--l': l, '--at': 0.06 + i * 0.08 } as V} />
          ))}
        </div>
        <div className="cg__stats">
          <p className="sc__kicker">R. Sharma · 64 (38)</p>
          <div><small>Fours</small><b><Num to={6} a={0.1} d={0.6} /></b></div>
          <div><small>Sixes</small><b className="lime"><Num to={3} a={0.2} d={0.6} /></b></div>
          <div><small>Strike rate</small><b><Num to={168} a={0.1} d={0.6} /></b></div>
          <span className="cg__legend"><i className="b4" />Four <i className="b6" />Six</span>
        </div>
      </div>
    </Frame>
  )
}

/* ---------------- Concepts (original UI ideas, labelled 'Concept') ---------------- */

function VyPlan() {
  const days = [['Day 1', 'Lisbon', 'Alfama walk · Pastéis · Fado night'], ['Day 2', 'Sintra', 'Pena Palace · Cabo da Roca sunset'], ['Day 3', 'Porto', 'Ribeira · Port tasting · Livraria']]
  return (
    <Frame kind="vy" title="Voyara · Trip planner" tag="Concept">
      <div className="vy">
        <div className="vy__map">
          <svg viewBox="0 0 200 200" preserveAspectRatio="none">
            <path className="vy__coast" d="M150 0 C120 40 135 70 110 100 S120 160 95 200" />
            <path className="cw__line vy__route" pathLength={1} d="M70 150 C80 125 60 110 75 90 S100 60 92 35" />
          </svg>
          <span className="vy__pin k" style={at(0.08, { left: '35%', top: '75%' })}>1</span>
          <span className="vy__pin k" style={at(0.3, { left: '37%', top: '45%' })}>2</span>
          <span className="vy__pin k" style={at(0.52, { left: '46%', top: '17%' })}>3</span>
        </div>
        <div className="vy__plan">
          <p className="vy__prompt type" style={at(0.02, { '--dur': 0.12 })}>“5 days in Portugal, food + sunsets, ₹1.2L budget”</p>
          {days.map(([d, c, t], i) => (
            <div key={d} className="vy__day k" style={at(0.14 + i * 0.2)}><b>{d}</b><span><strong>{c}</strong><small>{t}</small></span></div>
          ))}
          <div className="vy__foot k" style={at(0.74)}><span>Est. ₹<Num to={112400} a={0.74} d={0.15} /></span><span className="vy__book">Book trip →</span></div>
        </div>
      </div>
    </Frame>
  )
}

function EcVoice() {
  return (
    <Frame kind="ec" title="Echo · Voice notes" tag="Concept">
      <div className="ec">
        <div className="ec__rec">
          <span className="ec__dot" />
          <span className="ec__time">00:<Num to={42} a={0} d={0.4} /></span>
          <div className="ec__wave">{Array.from({ length: 40 }, (_, i) => <i key={i} style={{ '--i': i } as V} />)}</div>
        </div>
        <div className="ec__out">
          <p className="sc__kicker">Transcript</p>
          <p className="ec__tr type" style={at(0.1, { '--dur': 0.3 })}>“So for the launch we move the beta to Friday, Riya owns the landing page and I’ll draft the email…”</p>
          <p className="sc__kicker k" style={at(0.45)}>AI summary</p>
          {['Beta launch moves to Friday', 'Riya → landing page', 'You → launch email draft'].map((t, i) => (
            <p key={t} className="ec__pt k" style={at(0.5 + i * 0.07)}><span>✓</span>{t}</p>
          ))}
          <span className="ec__tag k" style={at(0.75)}>Added 2 tasks to Today</span>
        </div>
      </div>
    </Frame>
  )
}

function NbDeploy() {
  const log = ['$ nimbus deploy api --prod', '› Building image  python:3.12-slim', '› Running 128 tests …… passed', '› Pushing to registry  (41 MB)', '› Rolling out 3/3 replicas', '✓ Live at api.example.dev in 38s']
  const st = ['Build', 'Test', 'Push', 'Deploy']
  return (
    <Frame kind="nb" title="Nimbus · Deploy" tag="Concept">
      <div className="nb">
        <div className="nb__stages">
          {st.map((s, i) => (
            <div key={s} className="nb__stage"><span className="nb__ok k" style={at(0.18 + i * 0.16)}>✓</span><b>{s}</b><span className="bar"><span className="f" style={at(0.04 + i * 0.16, { '--dur': 0.15 })} /></span></div>
          ))}
        </div>
        <div className="nb__term">
          {log.map((l, i) => <p key={l} className={`k ${i === log.length - 1 ? 'nb__done' : ''}`} style={at(0.02 + i * 0.13)}>{l}</p>)}
          <span className="nb__caret" />
        </div>
      </div>
    </Frame>
  )
}

function LgDash() {
  const bars = [0.42, 0.55, 0.48, 0.66, 0.58, 0.74, 0.69, 0.88]
  return (
    <Frame kind="lg" title="Ledgerly · Revenue" tag="Concept">
      <div className="lg">
        <div className="lg__kpis">
          <div><small>MRR</small><b>₹<Num to={482} a={0.05} d={0.35} />K</b><em className="up">▲ 18%</em></div>
          <div><small>Paid invoices</small><b><Num to={136} a={0.1} d={0.35} /></b><em className="up">▲ 9%</em></div>
          <div><small>Overdue</small><b><Num to={4} a={0.15} d={0.35} /></b><em className="dn">▼ 2</em></div>
        </div>
        <div className="lg__chart">{bars.map((h, i) => <span key={i} className="lg__bar f" style={at(0.08 + i * 0.04, { '--dur': 0.25, '--to': h })} />)}</div>
        <div className="lg__inv k" style={at(0.55)}>
          <span><b>INV-2041</b><small>Acme Studio · ₹84,000</small></span>
          <span className="lg__stamp k" style={at(0.7)}>PAID</span>
        </div>
      </div>
    </Frame>
  )
}

function PlCoach() {
  const rings: [number, string][] = [[0.82, '#ff4d6d'], [0.64, '#a3ff4d'], [0.9, '#4dd6ff']]
  return (
    <Frame kind="pl" title="Pulse · AI coach" tag="Concept">
      <div className="pl">
        <div className="pl__rings">
          {rings.map(([v, c], i) => (
            <span key={i} className="pl__ring f" style={at(0.05 + i * 0.06, { '--dur': 0.4, '--to': v, '--c': c, '--i': i })} />
          ))}
          <span className="pl__mid"><b><Num to={8420} a={0.05} d={0.4} /></b><small>steps</small></span>
        </div>
        <div className="pl__side">
          <div className="pl__hr"><small>Heart rate</small><b><Num from={96} to={142} a={0.1} d={0.6} /> <span>bpm</span></b>
            <svg viewBox="0 0 200 40" preserveAspectRatio="none"><path className="cw__line pl__ecg" pathLength={1} d="M0 25 L40 25 L50 10 L58 35 L66 25 L110 25 L120 6 L128 38 L136 25 L200 25" /></svg>
          </div>
          <div className="pl__msg k" style={at(0.55)}><span>AI</span><p>Great pace! Hold zone 3 for 6 more minutes, then cool down.</p></div>
        </div>
      </div>
    </Frame>
  )
}

function SwTrack() {
  return (
    <Frame kind="sw" title="Swift · Live order" tag="Concept">
      <div className="sw">
        <div className="sw__map">
          <svg viewBox="0 0 300 180" preserveAspectRatio="none">
            {[30, 75, 120, 160].map((y) => <line key={y} className="sw__road" x1="0" x2="300" y1={y} y2={y + 10} />)}
            {[50, 140, 230].map((x) => <line key={x} className="sw__road" x1={x} x2={x - 15} y1="0" y2="180" />)}
            <path className="cw__line sw__route" pathLength={1} d="M40 150 L120 140 L130 80 L220 70 L235 30" />
          </svg>
          <span className="sw__rider" />
          <span className="sw__home">⌂</span>
        </div>
        <div className="sw__card">
          <p className="sc__kicker">Arriving in</p>
          <p className="sw__eta"><Num from={9} to={1} a={0.05} d={0.8} /> <span>min</span></p>
          <div className="sw__steps">
            {['Order packed', 'Picked up', 'On the way', 'Delivered'].map((s, i) => <span key={s} className="k" style={at(0.05 + i * 0.25)}>● {s}</span>)}
          </div>
        </div>
      </div>
    </Frame>
  )
}

/* ---------------- Templates for the remaining concepts: dashboard · phone app · AI chat ---------------- */

type Pal = { acc: string; acc2: string; bg: string; panel: string; ink: string; mut: string; line: string }
const pal = (p: Pal): V => ({ '--acc': p.acc, '--acc2': p.acc2, '--bg': p.bg, '--panel': p.panel, '--ink': p.ink, '--mut': p.mut, '--line': p.line })
const DARK = { bg: '#0f1118', panel: '#151824', ink: '#eef1f8', mut: '#8b91a7', line: '#252a3a' }
const LIGHT = { bg: '#f7f7fa', panel: '#ffffff', ink: '#14161f', mut: '#6c7186', line: '#e4e6ee' }

type Kpi = { l: string; to: number; pre?: string; post?: string; d: string; up?: boolean }
type DashCfg = { title: string; p: Pal; kpis: Kpi[]; chart: 'bars' | 'line'; vals: number[]; chartLabel: string; list: [string, number][]; listLabel: string }

function Dash({ title, p, kpis, chart, vals, chartLabel, list, listLabel }: DashCfg) {
  const pts = vals.map((v, i) => `${((i / (vals.length - 1)) * 400).toFixed(0)} ${(130 - v * 115).toFixed(0)}`)
  const line = `M${pts.join(' L')}`
  return (
    <Frame kind="tpl" title={title} tag="Concept" style={pal(p)}>
      <div className="td">
        <nav className="td__nav">{Array.from({ length: 5 }, (_, i) => <i key={i} className={i === 1 ? 'on' : ''} />)}</nav>
        <div className="td__main">
          <div className="td__kpis">
            {kpis.map((k, i) => (
              <div key={k.l} className="td__kpi k" style={at(0.04 + i * 0.05)}>
                <small>{k.l}</small>
                <b><Num to={k.to} pre={k.pre} post={k.post} a={0.06 + i * 0.05} d={0.35} /></b>
                <em className={k.up === false ? 'dn' : 'up'}>{k.d}</em>
              </div>
            ))}
          </div>
          <div className="td__chart">
            <p className="sc__kicker">{chartLabel}</p>
            {chart === 'bars'
              ? <div className="td__bars">{vals.map((v, i) => <span key={i} className="td__bar f" style={at(0.12 + i * 0.035, { '--dur': 0.25, '--to': v })} />)}</div>
              : (
                <svg className="td__line" viewBox="0 0 400 140" preserveAspectRatio="none">
                  <defs><linearGradient id={`g-${title.length}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={p.acc} stopOpacity=".35" /><stop offset="1" stopColor={p.acc} stopOpacity="0" /></linearGradient></defs>
                  <path className="cw__area" d={`${line} L400 140 L0 140 Z`} fill={`url(#g-${title.length})`} />
                  <path className="cw__line td__stroke" pathLength={1} d={line} />
                </svg>
              )}
          </div>
        </div>
        <div className="td__side">
          <p className="sc__kicker">{listLabel}</p>
          {list.map(([l, v], i) => (
            <div key={l} className="td__row k" style={at(0.3 + i * 0.07)}>
              <span><b>{l}</b><b className="td__pct"><Num to={Math.round(v * 100)} a={0.32 + i * 0.07} post="%" /></b></span>
              <span className="bar"><span className="f" style={at(0.32 + i * 0.07, { '--dur': 0.3, '--to': v })} /></span>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  )
}

type PhoneCfg = { title: string; p: Pal; head: string; big: { to: number; pre?: string; post?: string }; sub: string; rows: [string, string, string][]; float: [string, string]; toast: string }

function App({ title, p, head, big, sub, rows, float, toast }: PhoneCfg) {
  return (
    <Frame kind="tpl" title={title} tag="Concept" style={pal(p)}>
      <div className="ta">
        <div className="ta__phone">
          <span className="ta__notch" />
          <div className="ta__screen">
            <p className="sc__kicker">{head}</p>
            <p className="ta__big"><Num to={big.to} pre={big.pre} post={big.post} a={0.06} d={0.35} /></p>
            <p className="ta__sub">{sub}</p>
            {rows.map(([ic, l, v], i) => (
              <div key={l} className="ta__row k" style={at(0.16 + i * 0.07)}><span className="ta__ic">{ic}</span><span>{l}</span><b>{v}</b></div>
            ))}
          </div>
        </div>
        <div className="ta__float k" style={at(0.5)}><small>{float[0]}</small><b>{float[1]}</b></div>
        <div className="ta__toast k" style={at(0.66)}>{toast}</div>
      </div>
    </Frame>
  )
}

type ChatCfg = { title: string; p: Pal; doc: string; marks: number[]; q: string; think: string; a: [string, string][]; cite: string; code?: boolean }

function Assist({ title, p, doc, marks, q, think, a, cite, code }: ChatCfg) {
  return (
    <Frame kind="tpl" title={title} tag="Concept" style={pal(p)}>
      <div className="tc">
        <div className={`tc__doc ${code ? 'tc__doc--code' : ''}`}>
          <p className="sc__kicker">{doc}</p>
          {Array.from({ length: 11 }, (_, i) => (
            <span key={i} className={`tc__ln ${marks.includes(i) ? 'is-mark' : ''} ${code ? (i % 4 === 1 ? 'is-add' : i % 5 === 3 ? 'is-del' : '') : ''}`}
              style={{ ...at(0.36 + marks.indexOf(i) * 0.08), width: `${55 + ((i * 37) % 40)}%` }} />
          ))}
        </div>
        <div className="tc__chat">
          <div className="tc__q type" style={at(0.03, { '--dur': 0.15 })}>{q}</div>
          <div className="hc__think k" style={at(0.2)}><span className="dots"><i /><i /><i /></span> {think}</div>
          <div className="tc__a">
            {a.map(([b, t], i) => <span key={b} className="k" style={at(0.38 + i * 0.08)}><b>{b}</b> {t}</span>)}
            <span className="tc__cite k" style={at(0.66)}>{cite}</span>
          </div>
        </div>
      </div>
    </Frame>
  )
}

const P = (acc: string, acc2: string, base: typeof DARK) => ({ acc, acc2, ...base })

const ORBIT: DashCfg = { title: 'Orbit · Team goals', p: P('#7c5cff', '#22d3ee', DARK), chart: 'line', chartLabel: 'Goal progress · Q3', listLabel: 'Key results',
  vals: [0.18, 0.26, 0.24, 0.38, 0.45, 0.43, 0.58, 0.66, 0.71, 0.84],
  kpis: [{ l: 'Objectives', to: 12, d: '3 new' }, { l: 'On track', to: 9, d: '▲ 2' }, { l: 'Velocity', to: 87, post: '%', d: '▲ 6%' }],
  list: [['Launch v2', 0.78], ['Hire 3 engineers', 0.66], ['Cut churn to 2%', 0.52]] }
const KART: DashCfg = { title: 'Kart · Store analytics', p: P('#ff5a5f', '#ffb86b', LIGHT), chart: 'bars', chartLabel: 'Revenue · last 10 days', listLabel: 'Top products',
  vals: [0.42, 0.5, 0.46, 0.62, 0.58, 0.7, 0.64, 0.78, 0.74, 0.92],
  kpis: [{ l: 'Revenue', to: 842, pre: '₹', post: 'K', d: '▲ 24%' }, { l: 'Orders', to: 1284, d: '▲ 11%' }, { l: 'Returns', to: 3, post: '%', d: '▼ 1%', up: false }],
  list: [['Linen shirt', 0.86], ['Canvas tote', 0.64], ['Desk lamp', 0.48]] }
const SHELF: DashCfg = { title: 'Shelf · Inventory', p: P('#10b981', '#a3e635', LIGHT), chart: 'bars', chartLabel: 'Stock moved · this week', listLabel: 'Low stock',
  vals: [0.55, 0.62, 0.48, 0.7, 0.82, 0.6, 0.76, 0.66],
  kpis: [{ l: 'SKUs', to: 2480, d: '▲ 120' }, { l: 'Low stock', to: 18, d: 'restock', up: false }, { l: 'Fill rate', to: 97, post: '%', d: '▲ 2%' }],
  list: [['Arabica beans 1kg', 0.14], ['Oat milk', 0.22], ['Paper cups', 0.31]] }
const MEDIQ: DashCfg = { title: 'Mediq · Clinic', p: P('#0ea5e9', '#6366f1', LIGHT), chart: 'line', chartLabel: 'Patients · today', listLabel: 'Doctors on duty',
  vals: [0.2, 0.35, 0.55, 0.7, 0.62, 0.5, 0.66, 0.8, 0.72, 0.6],
  kpis: [{ l: 'Patients', to: 64, d: '▲ 8' }, { l: 'Avg. wait', to: 12, post: ' min', d: '▼ 4 min' }, { l: 'Satisfied', to: 96, post: '%', d: '▲ 1%' }],
  list: [['Dr. Kapoor', 0.82], ['Dr. Fernandes', 0.64], ['Dr. Rao', 0.4]] }

const BLOOM: PhoneCfg = { title: 'Bloom · Plant care', p: P('#22c55e', '#facc15', DARK), head: 'My plants', big: { to: 3 }, sub: 'need water today',
  rows: [['🪴', 'Monstera', 'Water now'], ['🌿', 'Fiddle fig', 'In 2 days'], ['🌵', 'Snake plant', 'Happy'], ['🌱', 'Basil', 'More sun']], float: ['Room humidity', '62% · ideal'], toast: '💧 Reminder set for 8 AM' }
const CINE: PhoneCfg = { title: 'Reel · Movie tickets', p: P('#f43f5e', '#a855f7', DARK), head: 'Your booking', big: { to: 2, post: ' seats' }, sub: 'Dune: Part Three',
  rows: [['📅', 'Fri, 9:30 PM', 'IMAX'], ['💺', 'Row F', 'F7 · F8'], ['📍', 'Screen 4', 'Phoenix'], ['🍿', 'Combo', '+ ₹340']], float: ['Total paid', '₹1,020'], toast: '🎟️ Tickets ready to scan' }
const HABIT: PhoneCfg = { title: 'Habitly · Streaks', p: P('#f59e0b', '#ef4444', DARK), head: 'Current streak', big: { to: 21, post: ' days' }, sub: 'your best so far 🔥',
  rows: [['🏃', 'Run 3 km', 'Done'], ['📖', 'Read 20 pages', 'Done'], ['🧘', 'Meditate', '8 PM'], ['💧', '8 glasses', '5 / 8']], float: ['Weekly score', '92%'], toast: '✓ 3 of 4 habits done' }
const HOMELY: PhoneCfg = { title: 'Homely · Smart home', p: P('#38bdf8', '#818cf8', DARK), head: 'Living room', big: { to: 22, post: '°C' }, sub: 'Feels cosy · AC eco mode',
  rows: [['💡', 'Lights', '4 on'], ['🔒', 'Front door', 'Locked'], ['⚡', 'Energy today', '3.2 kWh'], ['📷', 'Cameras', 'All clear']], float: ['Next scene', 'Good night · 11 PM'], toast: '🌙 Good-night scene ready' }

const STACKR: ChatCfg = { title: 'Stackr · AI code review', p: P('#a78bfa', '#34d399', DARK), doc: 'rate_limit.py', marks: [1, 5, 9], code: true,
  q: 'Review PR #482: add rate limiting to /login', think: 'Reading 6 changed files',
  a: [['L42', 'Redis key has no TTL — counters never reset.'], ['L57', 'Use a sliding window; fixed windows allow bursts.'], ['Tests', 'Add a case for 429 + Retry-After.']], cite: '3 suggestions · ready to apply' }
const TUTOR: ChatCfg = { title: 'Tutor · AI study buddy', p: P('#fb7185', '#fbbf24', LIGHT), doc: 'Notes · Neural networks', marks: [2, 6],
  q: 'Explain backpropagation like I’m 15', think: 'Using your class notes',
  a: [['Idea', 'The network guesses, checks the error, then nudges every weight a little.'], ['Chain rule', 'Each layer passes the blame back to the one before it.'], ['Try it', '3 practice questions are ready for you.']], cite: 'From your notes · p. 4' }
const LEXI: ChatCfg = { title: 'Lexi · Contract review', p: P('#fbbf24', '#f97316', DARK), doc: 'Vendor agreement.pdf', marks: [3, 7, 9],
  q: 'Any risky clauses in this agreement?', think: 'Checking 18 pages against your playbook',
  a: [['§8.2', 'Auto-renews for 3 years unless cancelled 90 days early.'], ['§11', 'Liability is uncapped for the client only.'], ['§14', 'Disputes go to a foreign court.']], cite: '3 risks found · redlines drafted' }

/* ---------------- Second screens: each concept shows a different part of its product the second time round ---------------- */

const VOYARA2: PhoneCfg = { title: 'Voyara · Trip wallet', p: P('#ff6a3d', '#ffc15e', DARK), head: 'Portugal · 5 days', big: { to: 18, post: ' Oct' }, sub: 'departs in 6 days',
  rows: [['✈️', 'BOM → LIS', '6:40 AM'], ['🏨', 'Alfama Suites', '3 nights'], ['🚆', 'Lisbon → Porto', 'Day 4'], ['🎟️', 'Pena Palace', 'Booked']], float: ['Budget left', '₹7,600'], toast: '✈️ Web check-in is open' }
const ECHO2: PhoneCfg = { title: 'Echo · Today', p: P('#b18cff', '#ff7ab6', DARK), head: 'Your day', big: { to: 12, post: ' notes' }, sub: 'summarised automatically',
  rows: [['🎙️', 'Stand-up', '4 tasks'], ['💡', 'Idea · onboarding', 'Saved'], ['📞', 'Client call', '2 follow-ups'], ['🛒', 'Groceries', 'List']], float: ['Time saved this week', '3.5 hours'], toast: '✓ Follow-up email drafted' }
const NIMBUS2: DashCfg = { title: 'Nimbus · Service health', p: P('#3fb950', '#22d3ee', DARK), chart: 'line', chartLabel: 'p95 latency · 24h', listLabel: 'CPU by service',
  vals: [0.5, 0.46, 0.58, 0.44, 0.4, 0.52, 0.36, 0.34, 0.42, 0.3],
  kpis: [{ l: 'Deploys', to: 48, d: 'this week' }, { l: 'Uptime', to: 99, post: '.98%', d: '30 days' }, { l: 'p95', to: 120, post: ' ms', d: '▼ 18 ms' }],
  list: [['api', 0.62], ['worker', 0.44], ['web', 0.28]] }
const LEDGERLY2: ChatCfg = { title: 'Ledgerly · Finance copilot', p: P('#2f6bff', '#22d3ee', LIGHT), doc: 'Invoices · October', marks: [2, 5, 8],
  q: 'Which clients are late on payment?', think: 'Checking 142 invoices',
  a: [['Acme Studio', '₹84,000 · 12 days late'], ['Northwind', '₹36,500 · 5 days late'], ['Next step', 'Friendly reminders drafted for both.']], cite: '2 overdue · reminders ready' }
const PULSE2: DashCfg = { title: 'Pulse · Weekly report', p: P('#a3ff4d', '#4dd6ff', DARK), chart: 'bars', chartLabel: 'Active minutes · Mon–Sun', listLabel: 'Goals',
  vals: [0.45, 0.62, 0.38, 0.8, 0.7, 0.92, 0.55],
  kpis: [{ l: 'Workouts', to: 5, d: '▲ 1' }, { l: 'Calories', to: 3240, d: '▲ 12%' }, { l: 'Sleep', to: 7, post: 'h 20m', d: 'avg' }],
  list: [['Run 20 km', 0.74], ['Strength × 3', 0.66], ['10k steps daily', 0.86]] }
const SWIFT2: DashCfg = { title: 'Swift · Fleet ops', p: P('#ffb800', '#ff6a3d', LIGHT), chart: 'bars', chartLabel: 'Orders by hour', listLabel: 'Riders online',
  vals: [0.2, 0.3, 0.55, 0.85, 0.7, 0.5, 0.62, 0.9, 0.78, 0.4],
  kpis: [{ l: 'Orders today', to: 3820, d: '▲ 14%' }, { l: 'Avg. delivery', to: 9, post: ' min', d: '▼ 1 min' }, { l: 'On time', to: 98, post: '%', d: '▲ 2%' }],
  list: [['Koramangala', 0.82], ['Indiranagar', 0.64], ['HSR Layout', 0.51]] }
const ORBIT2: ChatCfg = { title: 'Orbit · Ask your goals', p: P('#7c5cff', '#22d3ee', DARK), doc: 'Q3 objectives', marks: [1, 4, 8],
  q: 'What is blocking “Launch v2”?', think: 'Reading 34 updates from the team',
  a: [['Design', 'Checkout screens waiting on review since Tuesday.'], ['Backend', 'Payments API needs one more load test.'], ['Suggestion', 'Move the beta to Friday; ship v2 next week.']], cite: '2 blockers · owners notified' }
const STACKR2: DashCfg = { title: 'Stackr · Team insights', p: P('#a78bfa', '#34d399', DARK), chart: 'line', chartLabel: 'Bugs caught before merge', listLabel: 'Most flagged',
  vals: [0.2, 0.28, 0.35, 0.33, 0.48, 0.55, 0.6, 0.72, 0.7, 0.86],
  kpis: [{ l: 'PRs reviewed', to: 312, d: '▲ 40' }, { l: 'Bugs caught', to: 57, d: '▲ 12' }, { l: 'Time saved', to: 46, post: ' h', d: 'this month' }],
  list: [['Missing tests', 0.7], ['SQL injection risk', 0.42], ['Unused imports', 0.36]] }
const BLOOM2: ChatCfg = { title: 'Bloom · Plant doctor', p: P('#22c55e', '#facc15', LIGHT), doc: 'Photo · Monstera leaf', marks: [3, 6],
  q: 'Why are my monstera leaves turning yellow?', think: 'Looking at your photo and watering log',
  a: [['Likely', 'Overwatering — the soil stayed wet for 9 days.'], ['Fix', 'Water every 10 days and add a drainage hole.'], ['Light', 'Move it 1 m closer to the window.']], cite: 'Confidence 87% · plan updated' }
const KART2: PhoneCfg = { title: 'Kart · Checkout', p: P('#ff5a5f', '#ffb86b', LIGHT), head: 'Your bag', big: { to: 2840, pre: '₹' }, sub: '3 items · free delivery',
  rows: [['👕', 'Linen shirt', '₹1,490'], ['👜', 'Canvas tote', '₹690'], ['💡', 'Desk lamp', '₹660'], ['🏷️', 'Code SAVE10', '− ₹284']], float: ['Arrives', 'Tomorrow · 10 AM'], toast: '✓ Order placed' }
const TUTOR2: PhoneCfg = { title: 'Tutor · Quick quiz', p: P('#fb7185', '#fbbf24', LIGHT), head: 'Neural networks', big: { to: 8, post: ' / 10' }, sub: 'great work 🎉',
  rows: [['✅', 'Gradient descent', 'Correct'], ['✅', 'Activation functions', 'Correct'], ['❌', 'Chain rule', 'Review'], ['⏱️', 'Time', '6 min']], float: ['Streak', '5 days'], toast: '📚 2 flashcards added' }
const REEL2: DashCfg = { title: 'Reel · Box office', p: P('#f43f5e', '#a855f7', DARK), chart: 'bars', chartLabel: 'Tickets sold · this week', listLabel: 'Shows filling up',
  vals: [0.4, 0.48, 0.44, 0.6, 0.86, 0.95, 0.8],
  kpis: [{ l: 'Tickets', to: 12480, d: '▲ 22%' }, { l: 'Occupancy', to: 81, post: '%', d: '▲ 6%' }, { l: 'Refunds', to: 2, post: '%', d: '▼ 1%', up: false }],
  list: [['Dune · 9:30 PM', 0.94], ['Inside Out 3 · 6 PM', 0.78], ['Interstellar · 11 PM', 0.6]] }
const SHELF2: PhoneCfg = { title: 'Shelf · Scan & restock', p: P('#10b981', '#a3e635', DARK), head: 'Restock list', big: { to: 18, post: ' items' }, sub: 'scanned in 2 minutes',
  rows: [['☕', 'Arabica beans', '× 12'], ['🥛', 'Oat milk', '× 24'], ['🥤', 'Paper cups', '× 500'], ['🧾', 'Supplier', 'BeanCo']], float: ['Order total', '₹18,400'], toast: '📦 Purchase order sent' }
const LEXI2: DashCfg = { title: 'Lexi · Contract portfolio', p: P('#fbbf24', '#f97316', DARK), chart: 'line', chartLabel: 'Contracts reviewed', listLabel: 'Renewals due',
  vals: [0.15, 0.22, 0.3, 0.42, 0.4, 0.55, 0.63, 0.7, 0.78, 0.9],
  kpis: [{ l: 'Reviewed', to: 184, d: '▲ 26' }, { l: 'Risks found', to: 39, d: '12 fixed' }, { l: 'Hours saved', to: 120, post: ' h', d: 'this quarter' }],
  list: [['Cloud hosting', 0.88], ['Office lease', 0.55], ['Payroll vendor', 0.32]] }
const HABIT2: DashCfg = { title: 'Habitly · Insights', p: P('#f59e0b', '#ef4444', DARK), chart: 'line', chartLabel: 'Habits done · 30 days', listLabel: 'Consistency',
  vals: [0.3, 0.42, 0.38, 0.55, 0.5, 0.64, 0.7, 0.66, 0.82, 0.9],
  kpis: [{ l: 'Best streak', to: 21, post: ' d', d: 'new record' }, { l: 'Done', to: 86, post: '%', d: '▲ 9%' }, { l: 'Habits', to: 4, d: 'active' }],
  list: [['Reading', 0.92], ['Running', 0.8], ['Meditation', 0.58]] }
const MEDIQ2: PhoneCfg = { title: 'Mediq · Patient app', p: P('#0ea5e9', '#6366f1', LIGHT), head: 'Next appointment', big: { to: 11, post: ':30 AM' }, sub: 'Today · Dr. Kapoor',
  rows: [['🩺', 'General check-up', 'Room 4'], ['💊', 'Prescription', 'Ready'], ['🧪', 'Blood test', 'Normal'], ['⏳', 'Queue', '2 ahead']], float: ['Wait time', '≈ 8 min'], toast: '🔔 You are next in line' }
const HOMELY2: DashCfg = { title: 'Homely · Energy', p: P('#38bdf8', '#818cf8', DARK), chart: 'bars', chartLabel: 'Energy use · kWh per day', listLabel: 'Biggest users',
  vals: [0.62, 0.58, 0.7, 0.52, 0.48, 0.66, 0.44],
  kpis: [{ l: 'This week', to: 24, post: ' kWh', d: '▼ 11%' }, { l: 'Bill est.', to: 1860, pre: '₹', d: '▼ ₹210' }, { l: 'Solar', to: 38, post: '%', d: 'of usage' }],
  list: [['Air conditioner', 0.64], ['Water heater', 0.4], ['Fridge', 0.22]] }

const SCENES: Record<string, () => ReactNode> = {
  'hyb-parse': HybParse, 'hyb-match': HybMatch, 'hyb-copilot': HybCopilot, 'hyb-pipeline': HybPipeline,
  'dhn-spend': DhnSpend, 'dhn-split': DhnSplit, 'dhn-budget': DhnBudget,
  'crk-live': CrkLive, 'crk-winprob': CrkWinProb, 'crk-wagon': CrkWagon,
  'vy-plan': VyPlan, 'ec-voice': EcVoice, 'nb-deploy': NbDeploy, 'lg-dash': LgDash, 'pl-coach': PlCoach, 'sw-track': SwTrack,
  orbit: () => <Dash {...ORBIT} />, kart: () => <Dash {...KART} />, shelf: () => <Dash {...SHELF} />, mediq: () => <Dash {...MEDIQ} />,
  bloom: () => <App {...BLOOM} />, reel: () => <App {...CINE} />, habitly: () => <App {...HABIT} />, homely: () => <App {...HOMELY} />,
  stackr: () => <Assist {...STACKR} />, tutor: () => <Assist {...TUTOR} />, lexi: () => <Assist {...LEXI} />,
  'voyara-2': () => <App {...VOYARA2} />, 'echo-2': () => <App {...ECHO2} />, 'nimbus-2': () => <Dash {...NIMBUS2} />, 'ledgerly-2': () => <Assist {...LEDGERLY2} />,
  'pulse-2': () => <Dash {...PULSE2} />, 'swift-2': () => <Dash {...SWIFT2} />, 'orbit-2': () => <Assist {...ORBIT2} />, 'stackr-2': () => <Dash {...STACKR2} />,
  'bloom-2': () => <Assist {...BLOOM2} />, 'kart-2': () => <App {...KART2} />, 'tutor-2': () => <App {...TUTOR2} />, 'reel-2': () => <Dash {...REEL2} />,
  'shelf-2': () => <App {...SHELF2} />, 'lexi-2': () => <Dash {...LEXI2} />, 'habitly-2': () => <Dash {...HABIT2} />, 'mediq-2': () => <App {...MEDIQ2} />,
  'homely-2': () => <Dash {...HOMELY2} />,
}

export function Scene({ id }: { id: string }) {
  const S = SCENES[id]
  return S ? <S /> : null
}
