import { site } from '../content/site'
import { Logo } from './ui/Logo'
import './footer.css'

/** Ruled band with only the mark, centred — it scrolls back to the top. */
export function Footer() {
  return (
    <footer className="footer">
      <a href="#top" className="footer__mark" aria-label={`${site.name} — back to top`}>
        <Logo />
      </a>
    </footer>
  )
}
