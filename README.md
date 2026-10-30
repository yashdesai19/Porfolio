# Yash Desai — portfolio

React 19 + Vite + TypeScript, GSAP + Lenis for motion. The page is prerendered at build time (`scripts/prerender.mjs`), which also writes the SEO/share tags, `robots.txt` and `sitemap.xml`.

## Develop
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc + client build + SSR prerender → dist/
npm run preview    # serve dist/ on http://localhost:4173
npm run lint
```
Useful URL flags: `?reduced` (no motion), `?perf=high|mid|low` (force a quality tier), `?hud` (FPS overlay).

## Content
Everything visible lives in `src/content/site.ts`. Project clips go in `public/media/projects/` (960px `-md` and 640px `-sm` MP4 + a JPG poster). Unused/source media is kept in `media-src/` (git-ignored, not deployed).

## Deploy (Vercel)
`vercel.json` already sets the build command, the `dist` output and cache/security headers.
Connect this GitHub repository to a Vercel project to deploy automatically on pushes to `master`. Or run `npx vercel` and log in.
1. On vercel.com → **Add New → Project** → import this repository (no build settings to change).
2. To have contact-form messages delivered directly to `yashhdesai.work@gmail.com`, create a Web3Forms access key using that inbox. For local development, copy `.env.example` to `.env.local` and set `VITE_WEB3FORMS_KEY` to the key.
3. Vercel → Project → **Settings → Environment Variables**:
   - `VITE_WEB3FORMS_KEY` — required for direct form delivery. Without it, the contact form only opens the visitor's mail app.
   - `SITE_URL` — set this to your public URL if you use a custom domain or disable Vercel system environment variables. Otherwise the Vercel production domain is used for canonical/share tags.
4. Redeploy after changing env vars (they are read at build time).
