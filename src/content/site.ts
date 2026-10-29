// Central content config. Only verified facts go here.

export type Project = {
  id: string
  title: string
  tagline: string
  stack: string[]
  year?: string
  url?: string // public link, only when confirmed
  code: string // short tag shown on cards, e.g. HYB
  // Clips stream through the Work stage. Add real files later — no code changes needed.
  // Each: /media/<file>.mp4 (1280×720 H.264, muted, ≤3 MB, 6–10 s loop) + .jpg poster (≤150 KB).
  // A clip without `video` renders as a labelled placeholder.
  // Optional `videoSm`: a ~480p encode used on phones and lower quality tiers.
  // `scene`: an animated product preview (src/components/WorkScenes.tsx), used when there is no video.
  clips: { video?: string; videoSm?: string; poster?: string; scene?: string }[]
  published: boolean
  concept?: boolean // a design concept (not shipped client work): labelled 'Concept' on its card
  backdrop?: boolean // video sits on a designed backdrop (its black frame blends away)
}

export const site = {
  name: 'Yash Desai',
  role: 'AI Product Builder & Full-Stack Developer',
  title: 'AI Product Builder',

  header: {
    tag: 'AI Product Builder',
    // Rolling header console (playful status lines, no claims)
    console: ['Hello, I’m Yash', 'Ahmedabad, India', 'pip install ideas', 'Parsing resumes at HYBENT', 'Asking the LLM nicely', 'Grounding answers with RAG', 'git push --to-prod', 'Build. Break. Learn. Repeat'],
    lines: ['Building AI products.', 'Full-stack · Python · FastAPI · React'],
    cta: 'Get in touch',
  },
  location: 'Ahmedabad, India',
  availability: 'Open to freelance projects, collaborations and product work.', // confirm wording

  hero: {
    lines: ['AI Product', 'Builder'], // approved
    split: ['AI Product', 'Builder'], // left ✦ right on one line
    sub: 'Full-stack developer shipping LLM-powered SaaS with Python, FastAPI, React and TypeScript.',
    cta: { label: 'Get in touch', href: '#contact' },
  },

  about: {
    // Approved copy (user, Phase 3)
    lead: 'I’m Yash Desai, an AI Product Builder. I build products like HYBENT Hiring and enjoy turning ideas into useful, real-world products.',
    paragraphs: [
      'I build backend systems, APIs and AI-powered applications with Python, FastAPI, PostgreSQL and React. I’m exploring LLMs, RAG and AI agents, and how to make AI genuinely useful in real products.',
      'I like understanding how things work behind the scenes and finding better ways to build them. I learn by building, testing ideas and improving through real implementation — for me, good technology isn’t about looking impressive, it’s about being useful.',
    ],
    // `accent` is the word set in the italic serif
    highlights: [
      { label: 'Building', accent: 'HYBENT', detail: 'AI-powered recruitment platform.' },
      { label: 'AI Product Building', accent: 'Intelligent', detail: 'Applications and workflows.' },
      { label: 'Backend Engineering', accent: 'Python', detail: 'FastAPI, APIs, and databases.' },
      { label: 'Always Building', accent: 'Experiments', detail: 'New technologies and side projects.' },
    ],
  },

  projects: [
    {
      id: 'hybent',
      code: 'HYB',
      clips: [{ video: '/media/projects/hybent-1-md.mp4', videoSm: '/media/projects/hybent-1-sm.mp4', poster: '/media/projects/hybent-1.jpg' }, { video: '/media/projects/hybent-2-md.mp4', videoSm: '/media/projects/hybent-2-sm.mp4', poster: '/media/projects/hybent-2.jpg' }, { video: '/media/projects/hybent-3-md.mp4', videoSm: '/media/projects/hybent-3-sm.mp4', poster: '/media/projects/hybent-3.jpg' }, { video: '/media/projects/hybent-4-md.mp4', videoSm: '/media/projects/hybent-4-sm.mp4', poster: '/media/projects/hybent-4.jpg' }], // real recordings (demo data); 960px (-md) and 640px (-sm) encodes of the 1600px originals
      title: 'Hybent Hiring',
      tagline: 'AI-powered recruitment platform',
      stack: ['Python', 'FastAPI', 'PostgreSQL', 'Supabase', 'React', 'TypeScript', 'Celery', 'Redis', 'LLMs', 'RAG'],
      published: true,
    },
    {
      id: 'dhan',
      code: 'DHN',
      clips: [{ video: '/media/projects/dhan-1-md.mp4', videoSm: '/media/projects/dhan-1-sm.mp4', poster: '/media/projects/dhan-1.jpg' }, { video: '/media/projects/dhan-3-md.mp4', videoSm: '/media/projects/dhan-3-sm.mp4', poster: '/media/projects/dhan-3.jpg' }, { video: '/media/projects/dhan-4-md.mp4', videoSm: '/media/projects/dhan-4-sm.mp4', poster: '/media/projects/dhan-4.jpg' }], // real recordings (demo data), shown on a designed backdrop
      title: 'DHAN',
      tagline: 'Mobile-first expense tracking app',
      stack: ['React Native', 'TypeScript', 'Expo'],
      published: true,
      backdrop: true,
    },
    {
      id: 'gamebling',
      code: 'GMB',
      clips: [{ scene: 'crk-live' }, { scene: 'crk-winprob' }, { scene: 'crk-wagon' }], // animated match-centre previews
      title: 'Gamebling',
      tagline: 'Live cricket platform with real-time match data',
      stack: ['Python', 'FastAPI', 'React', 'APScheduler', 'Razorpay'],
      published: true,
    },
    // Design concepts: original UI ideas, clearly labelled 'Concept' on their cards
    { id: 'voyara', code: 'VOY', concept: true, published: true, title: 'Voyara', tagline: 'AI travel planner', stack: ['React', 'LLMs', 'Maps'], clips: [{ scene: 'vy-plan' }, { scene: 'voyara-2' }] },
    { id: 'echo', code: 'ECH', concept: true, published: true, title: 'Echo', tagline: 'AI voice notes that summarise themselves', stack: ['Whisper', 'LLMs', 'React Native'], clips: [{ scene: 'ec-voice' }, { scene: 'echo-2' }] },
    { id: 'nimbus', code: 'NMB', concept: true, published: true, title: 'Nimbus', tagline: 'One-click deploy console', stack: ['Docker', 'FastAPI', 'WebSockets'], clips: [{ scene: 'nb-deploy' }, { scene: 'nimbus-2' }] },
    { id: 'ledgerly', code: 'LDG', concept: true, published: true, title: 'Ledgerly', tagline: 'Invoicing & revenue dashboard', stack: ['React', 'PostgreSQL', 'Stripe'], clips: [{ scene: 'lg-dash' }, { scene: 'ledgerly-2' }] },
    { id: 'pulse', code: 'PLS', concept: true, published: true, title: 'Pulse', tagline: 'AI fitness coach', stack: ['React Native', 'HealthKit', 'LLMs'], clips: [{ scene: 'pl-coach' }, { scene: 'pulse-2' }] },
    { id: 'swift', code: 'SWF', concept: true, published: true, title: 'Swift', tagline: '10-minute delivery tracking', stack: ['React', 'WebSockets', 'Maps'], clips: [{ scene: 'sw-track' }, { scene: 'swift-2' }] },
    { id: 'orbit', code: 'ORB', concept: true, published: true, title: 'Orbit', tagline: 'Team goals & OKR tracking', stack: ['React', 'FastAPI', 'PostgreSQL'], clips: [{ scene: 'orbit' }, { scene: 'orbit-2' }] },
    { id: 'stackr', code: 'STK', concept: true, published: true, title: 'Stackr', tagline: 'AI code review for pull requests', stack: ['LLMs', 'GitHub API', 'Python'], clips: [{ scene: 'stackr' }, { scene: 'stackr-2' }] },
    { id: 'bloom', code: 'BLM', concept: true, published: true, title: 'Bloom', tagline: 'Plant care reminders', stack: ['React Native', 'Expo'], clips: [{ scene: 'bloom' }, { scene: 'bloom-2' }] },
    { id: 'kart', code: 'KRT', concept: true, published: true, title: 'Kart', tagline: 'E-commerce store analytics', stack: ['React', 'PostgreSQL', 'Charts'], clips: [{ scene: 'kart' }, { scene: 'kart-2' }] },
    { id: 'tutor', code: 'TUT', concept: true, published: true, title: 'Tutor', tagline: 'AI study buddy grounded in your notes', stack: ['RAG', 'LLMs', 'React'], clips: [{ scene: 'tutor' }, { scene: 'tutor-2' }] },
    { id: 'reel', code: 'REL', concept: true, published: true, title: 'Reel', tagline: 'Movie ticket booking', stack: ['React Native', 'Payments'], clips: [{ scene: 'reel' }, { scene: 'reel-2' }] },
    { id: 'shelf', code: 'SHF', concept: true, published: true, title: 'Shelf', tagline: 'Smart inventory for small shops', stack: ['FastAPI', 'PostgreSQL', 'React'], clips: [{ scene: 'shelf' }, { scene: 'shelf-2' }] },
    { id: 'lexi', code: 'LEX', concept: true, published: true, title: 'Lexi', tagline: 'AI contract review', stack: ['LLMs', 'RAG', 'Python'], clips: [{ scene: 'lexi' }, { scene: 'lexi-2' }] },
    { id: 'habitly', code: 'HAB', concept: true, published: true, title: 'Habitly', tagline: 'Habit tracker with streaks', stack: ['React Native', 'SQLite'], clips: [{ scene: 'habitly' }, { scene: 'habitly-2' }] },
    { id: 'mediq', code: 'MDQ', concept: true, published: true, title: 'Mediq', tagline: 'Clinic operations dashboard', stack: ['React', 'FastAPI', 'PostgreSQL'], clips: [{ scene: 'mediq' }, { scene: 'mediq-2' }] },
    { id: 'homely', code: 'HML', concept: true, published: true, title: 'Homely', tagline: 'Smart home control app', stack: ['React Native', 'IoT', 'WebSockets'], clips: [{ scene: 'homely' }, { scene: 'homely-2' }] },
    {
      id: 'energy',
      code: 'SEB',
      clips: [],
      title: 'Smart Energy Usage & Billing Analytics',
      tagline: 'Awaiting confirmation',
      stack: [],
      published: false, // hidden until user confirms
    },
  ] as Project[],

  personal: {
    title: 'Off the clock',
    // Receding headline lines (user-picked)
    lines: ['Built', 'with', 'code', '& coffee'],
    // Floating objects. kind: shape (abstract) | project (labelled tile) | image (src, later)
    objects: [
      { kind: 'logo' },
      { kind: 'ring' },
      { kind: 'project', label: 'HYBENT' },
      { kind: 'disc' },
      { kind: 'project', label: 'DHAN' },
      { kind: 'star' },
      { kind: 'project', label: 'GAMEBLING' },
      { kind: 'square' },
      { kind: 'code', label: '</>' },
    ] as { kind: 'logo' | 'ring' | 'disc' | 'star' | 'square' | 'project' | 'code' | 'image'; label?: string; src?: string }[],
  },

  contact: {
    email: 'yashhdesai.work@gmail.com',
    socials: [
      { label: 'GitHub', short: 'GH', href: 'https://github.com/yashdesai19' },
      { label: 'LinkedIn', short: 'in', href: 'https://www.linkedin.com/in/desaiyash494/' },
    ],
  },
}
