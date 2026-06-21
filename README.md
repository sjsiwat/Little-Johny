# Little Johny

> A lightweight personal operating system — tasks, notes, and expenses in one place.

**Live:** [johny.siwat.me](https://johny.siwat.me) &nbsp;|&nbsp; **Stack:** Vanilla JS · HTML5 · CSS3 · LocalStorage · Cloudflare Pages

---

## What it is

Little Johny is a privacy-first personal productivity PWA. No accounts, no backend, no tracking — everything lives in your browser. Inspired by Notion, Todoist, and personal finance apps, the goal is a single place to think, plan, and track daily life.

---

## Features

| Module | Highlights |
|---|---|
| **Dashboard** | Task summary, recent notes, expense overview, quick actions |
| **Tasks** | Create · Edit · Delete · Priority · Due dates · Completion tracking |
| **Notes** | Freeform notes with tag system |
| **Expenses** | Categorized spending records with simple summaries |
| **PWA** | Installable, offline-capable, custom icon + web manifest |
| **UI** | Light/Dark theme, fully responsive |

---

## Project Structure

```
little-johny/
├── index.html
├── app.js
├── styles.css
├── sw.js                    # Service worker (offline cache)
├── manifest.webmanifest
├── icon.svg
├── _headers                 # Cloudflare security headers
│
├── PRODUCT.md               # Vision, features, roadmap
├── DESIGN.md                # UI/UX guidelines
│
└── .agents/
    └── skills/impeccable/   # AI dev rules (UX review, frontend quality)
```

---

## Local Development

```bash
git clone <repository-url>
cd little-johny
python3 -m http.server 8080
# → http://localhost:8080
```

No build step. No dependencies. Open and run.

---

## Deployment

```
Local → Git commit → GitHub → Cloudflare Pages → johny.siwat.me
```

---

## Roadmap

### Phase 2 — Cloud & Integrations
- **Cloud sync** via Supabase (auth + multi-device)
- **LINE Secretary** — create tasks, log expenses, set reminders via LINE Messaging API
- **AI assistant** — daily planning, task prioritization, expense analysis

### Phase 3 — Scale
- OCR receipt scanning
- Advanced analytics
- Mobile app
- Multi-user / SaaS

---

## Development Notes

- Understand existing code before editing — avoid unnecessary rewrites
- Storage layer is LocalStorage; keep data shape backward-compatible
- Design consistency matters — refer to `DESIGN.md` before touching UI
- AI agents follow `.agents/skills/impeccable/` rules for UX quality

---

## License

Personal project — all rights reserved.
