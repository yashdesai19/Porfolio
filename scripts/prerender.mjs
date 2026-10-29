// Injects server-rendered HTML into dist/index.html so crawlers and link previews see real content.
import { readFile, writeFile, rm, readdir } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const dist = resolve('dist')
const { render } = await import(pathToFileURL(resolve('dist-ssr/entry-server.js')).href)

const template = await readFile(resolve(dist, 'index.html'), 'utf8')
const marker = '<div id="root"></div>'
if (!template.includes(marker)) throw new Error('prerender: root marker not found')

// Preload the two fonts the first screen is built from (display headline, mono header/tickers)
const assets = await readdir(resolve(dist, 'assets'))
const preloads = [/^archivo-latin-wdth-normal-.*\.woff2$/, /^ibm-plex-mono-latin-500-normal-.*\.woff2$/]
  .map((re) => assets.find((f) => re.test(f)))
  .filter(Boolean)
  .map((f) => `<link rel="preload" as="font" type="font/woff2" crossorigin href="/assets/${f}">`)
  .join('\n    ')
// Site URL for canonical / share tags: SITE_URL (custom domain) → Vercel's production domain → local preview
const host = process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) || 'http://localhost:4173'
const url = host.replace(/\/+$/, '') + '/'
const title = 'Yash Desai — AI Product Builder'
const desc = 'Yash Desai, AI Product Builder & Full-Stack Developer building LLM-powered products with Python, FastAPI, React and TypeScript.'
const attr = (v) => v.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
const person = {
  '@context': 'https://schema.org', '@type': 'Person', name: 'Yash Desai', url,
  jobTitle: 'AI Product Builder & Full-Stack Developer',
  address: { '@type': 'PostalAddress', addressLocality: 'Ahmedabad', addressCountry: 'IN' },
  sameAs: ['https://github.com/yashdesai19', 'https://www.linkedin.com/in/desaiyash494/'],
}
const seo = [
  `<link rel="canonical" href="${url}">`,
  `<meta name="theme-color" content="#4a0e1e">`,
  `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">`,
  `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`,
  `<meta property="og:type" content="website">`,
  `<meta property="og:url" content="${url}">`,
  `<meta property="og:title" content="${attr(title)}">`,
  `<meta property="og:description" content="${attr(desc)}">`,
  `<meta property="og:image" content="${url}og.jpg">`,
  `<meta property="og:image:width" content="1200">`,
  `<meta property="og:image:height" content="630">`,
  `<meta name="twitter:card" content="summary_large_image">`,
  `<meta name="twitter:title" content="${attr(title)}">`,
  `<meta name="twitter:description" content="${attr(desc)}">`,
  `<meta name="twitter:image" content="${url}og.jpg">`,
  `<script type="application/ld+json">${JSON.stringify(person)}</script>`,
].join('\n    ')

let html = template.replace(marker, `<div id="root">${render()}</div>`)
html = html.replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${attr(desc)}" />`)
html = html.replace('</head>', `  ${seo}\n  ${preloads}\n  </head>`)
await writeFile(resolve(dist, 'index.html'), html)
await writeFile(resolve(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${url}sitemap.xml\n`)
await writeFile(resolve(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${url}</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod></url>\n</urlset>\n`)
await rm(resolve('dist-ssr'), { recursive: true, force: true })
console.log('prerender: dist/index.html written')
