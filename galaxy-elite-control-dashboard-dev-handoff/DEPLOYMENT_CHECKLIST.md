# DEPLOYMENT_CHECKLIST.md

## Recommended architecture

```text
Next.js app: Vercel
DNS/security: Cloudflare
Database/auth: Supabase
CMS/public content: Sanity
Private documents: Supabase Storage or S3-compatible private storage
Email: Resend / SendGrid / Postmark
Analytics: Vercel Analytics / Google Analytics / Plausible
```

## Environment variables

Check `.env.example` and configure production variables.

Required categories:

- Site URL
- Admin emails
- Supabase URL/key
- Sanity project/dataset/token if used
- Email provider key
- WhatsApp provider keys if used
- Storage bucket settings

## Domain strategy

First launch:

```text
match.galaxyelite.ae
```

Main brand/site later:

```text
yourpropertymatch.co
yourpropertymatch.ae
yourpropertymatch.co.uk
```

## Vercel deployment

Tasks:

- Create Vercel project
- Connect GitHub repository
- Set environment variables
- Add production domain
- Configure preview branches
- Enable build checks
- Enable analytics/monitoring

## Cloudflare setup

Tasks:

- Add DNS records
- Use Cloudflare as DNS/CDN/security layer
- Configure SSL/TLS full strict
- Add redirects if needed
- Add WAF/basic bot protection
- Add caching rules carefully; do not cache private dashboards/admin

## Supabase setup

Tasks:

- Create Supabase project
- Run migrations
- Configure Auth providers
- Configure email templates
- Configure RLS policies
- Create storage buckets
- Set bucket privacy
- Create admin users/roles
- Test login/register

## Sanity setup

Use Sanity for:

- Market Pulse articles
- Public content pages
- Non-sensitive CMS content

Do not use Sanity for:

- Private IDs
- Title deeds
- Proof of funds
- Internal compliance notes
- Private match room data

## Pre-launch checklist

- Production build passes
- All environment variables set
- No secrets committed to Git
- Admin access tested
- Role permissions tested
- Public submissions hidden by default
- Document upload private
- Sitemap and robots correct
- Legal pages uploaded
- Contact/WhatsApp working
- Error pages working
- Backup plan active
- Monitoring active

## Post-launch checklist

- Monitor form submissions
- Monitor errors/logs
- Review first 50 submissions manually
- Check spam/bot traffic
- Test admin notifications
- Test SEO indexing
- Collect user feedback
- Prioritise beta fixes
