import Link from 'next/link'

export default function NotFound() {
  return <section className="page-hero"><p className="eyebrow">404</p><h1>Page not found.</h1><div className="hero-actions" style={{ justifyContent: 'center' }}><Link className="button button-gold" href="/">Back home</Link></div></section>
}
