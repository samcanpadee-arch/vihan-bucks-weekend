# Vihan’s Yarra Valley Bucks Weekend Microsite

A simple static Next.js site with two pages:

- `/` — trip hub and voting page
- `/itinerary` — final itinerary placeholder page

Built to deploy cleanly on Vercel with no database, auth, payments, or backend complexity.

## Deploy on Vercel (non-technical flow)

1. Push this repository to GitHub.
2. In Vercel, click **Add New Project**.
3. Import this GitHub repo.
4. Keep defaults and click **Deploy**.
5. Done — each push to `main` will auto-deploy.

## Updating the voting form link

In `app/page.js`, find this comment and replace the `href="#"` with your Google Form URL:

```jsx
{/* Paste your Google Form link here */}
<a href="#" className="btn btn-accent">
  Open voting form
</a>
```

## Local dev (optional for technical helpers)

```bash
npm install
npm run dev
```
