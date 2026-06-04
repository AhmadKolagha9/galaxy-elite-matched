# Deployment Plan: Vercel + Cloudflare

## Recommended architecture

- **Vercel**: Next.js app hosting, server actions, API routes, middleware and SSR.
- **Cloudflare**: DNS, WAF, SSL, redirects, bot protection and caching rules.
- **Sanity**: CMS and private match submission content.
- **Supabase**: production authentication and member profile database.

## Domains

Start with:

```text
match.galaxyelite.ae
```

Then connect:

```text
yourpropertymatch.co
yourpropertymatch.ae
yourpropertymatch.co.uk
```

## Vercel setup

1. Push the project to GitHub.
2. Import it into Vercel.
3. Set environment variables from `.env.example`.
4. Deploy.
5. Add the custom domain in Vercel.

## Cloudflare DNS setup

Use Cloudflare DNS records pointing to Vercel as instructed by the Vercel domain screen. Keep one canonical host for SEO and redirect other hosts to the correct landing page.

## SEO host strategy

- `galaxyelite.ae/private-match` or `match.galaxyelite.ae` = pilot/trusted brokerage layer.
- `yourpropertymatch.co` = global product platform later.
- `yourpropertymatch.ae` = UAE gateway.
- `yourpropertymatch.co.uk` = UK gateway.

Avoid duplicate content. Use canonical tags and redirect country domains to country landing pages.
