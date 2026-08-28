# Little Johny (JohnyMemo)

> A personal digital workspace — tasks, notes, expenses, calendar, and daily review in one place, with a LINE secretary in your pocket.

**Live:** [johny.siwat.me](https://johny.siwat.me) &nbsp;|&nbsp; **Stack:** React · Vite · Tailwind · Supabase · LINE Login · Cloudflare Workers

---

## What it is

Little Johny started as a local-only productivity PWA and has grown into a **LINE-first personal workspace**. Sign in with your LINE account, and your tasks, notes, and expenses sync to the cloud (Supabase) — usable from the web app or by chatting with the LINE bot. No email/password to remember; your LINE account *is* your account.

- **Guest mode** — try everything instantly; data is ephemeral (not persisted)
- **Logged in (LINE)** — LocalStorage for instant writes + debounced sync to Supabase

---

## Features

| Module | Highlights |
|---|---|
| **Dashboard** | Task summary, recent notes, expense overview, quick actions |
| **Tasks** | **Kanban** board (todo / in progress / review / done) · Priority · Due dates · Labels · Drag-and-drop |
| **Notes** | Freeform notes with tags — create, edit, and sync from web or LINE |
| **Calendar** | Month view of tasks and due dates |
| **Review** | Daily / weekly summaries — tasks done, overdue, notes, spending |
| **Expenses** | Categorized spending records with summaries |
| **Johny Buddy** 🐱 | Animated mascot companion — waves hello, celebrates finished tasks, thinks while syncing, sleeps late at night |
| **Cloud Sync** | Supabase-backed, offline-first with sync status indicator, safe deletes, empty-state wipe protection |
| **PWA** | Installable, offline cache via service worker, custom icons + manifest |
| **UI** | Warm paper workspace, no dark shell, one accent blue (see `docs/DESIGN.md`) · FAB quick actions · Fully responsive |

---

## Architecture

```
                    ┌─────────────────────────────┐
                    │   johny.siwat.me            │
                    │   Cloudflare Worker         │
                    │  (server/worker.js + assets)│
                    └──────┬──────────────┬───────┘
                           │              │
              /api/auth/line-callback   everything else
                           │              │
                     LINE Login      React SPA (web_dist/)
                     OAuth 2.1       landing + workspace
                           │         routes in one bundle
                           ▼              │
                    ┌─────────────┐       │ anon key + RLS
                    │  Supabase   │◄──────┘
                    │ Auth + DB   │
                    └──────▲──────┘
                           │ service role key
                    ┌──────┴──────┐
                    │ LINE Bot    │  (separate repo: johny-line-bot)
                    │ CF Worker   │
                    └─────────────┘
```

### Auth flow (LINE Login)

```
1. User clicks "Login with LINE" → redirected to LINE OAuth
2. LINE redirects back to /api/auth/line-callback (Cloudflare Worker)
3. Worker exchanges code → LINE profile → finds/creates Supabase user
   (deterministic email: line_<userId>@johny.internal)
4. Worker generates a Supabase magic link → browser lands back signed in
```

### Storage layer (`src/lib/storage.js`)

- **Guest:** ephemeral — nothing persisted
- **Logged in:** every save writes LocalStorage immediately, then syncs to Supabase after a 1.5s debounce
- Deletes hit Supabase immediately (no lost deletions on refresh)
- Demo/display-only items are stripped before syncing
- Never wipes cloud data when local state is empty (safety guard)

### Data model (Supabase)

| Table | Columns (key ones) |
|---|---|
| `tasks` | title, priority, due, status, labels, target_value / target_unit / progress_value |
| `notes` | title, body, tags |
| `expenses` | title, amount, category, date |
| `line_users` | line_user_id ↔ user_id mapping, display_name, picture_url, **plan** (`free` / `pro`) |

All tables protected by RLS (web) and filtered by `user_id` (bot, service role). Migrations live in `supabase_migration_*.sql`.

---

## Project Structure

One app, one `package.json`, one build. The landing page and the workspace are
routes in the same React Router tree.

```
little-johny/
├── index.html               # Vite entry — fonts, PWA meta, #root
├── src/
│   ├── main.jsx             # React root + service worker registration
│   ├── App.jsx              # Routes; the app half is lazy-loaded
│   ├── routes/
│   │   ├── landing/         # /  /about  /signup   + LandingLayout
│   │   ├── app/             # /dashboard /tasks /notes /expenses /calendar /review
│   │   │                    #   + AppLayout (auth gate, sidebar, topbar)
│   │   └── NotFound.jsx
│   ├── components/
│   │   ├── landing/         # hero, nav, capabilities, process, footer, …
│   │   ├── shared/          # Sidebar, Topbar, Modal, Toast, Fab, Mascot, AuthGate
│   │   └── tasks|notes|expenses|calendar|dashboard|review/
│   ├── lib/                 # store (zustand), storage, auth, actions, format, …
│   └── styles/globals.css   # Tailwind layers + editor and theme styles
├── public/                  # icons, mascot frames, manifest, sw.js
├── server/
│   ├── worker.js            # Cloudflare Worker: LINE callback + static assets
│   ├── wrangler.toml        # Worker config (name: johnyos)
│   ├── headers              # Security headers → copied to web_dist/_headers
│   └── .env.example         # Worker secrets + optional client build vars
├── supabase/migrations/     # 001_v2 … 004_task_progress
├── scripts/deploy.sh        # build → headers → wrangler deploy
├── docs/                    # DESIGN.md, PRODUCT.md (local-only), mascot.md
└── web_dist/                # Build output — gitignored, rebuilt every deploy
```

---

## Local Development

```bash
git clone <repository-url>
cd little-johny
npm install
npm run dev                     # → http://localhost:3000
```

`src/lib/supabaseClient.js` falls back to the public Supabase URL and anon key,
so login works without any local env file. To point the build at a different
project, put `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` /
`VITE_LINE_CHANNEL_ID` in a root `.env.local` — see `server/.env.example`.

The Worker's own secrets (`LINE_CHANNEL_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`)
are set with `npx wrangler secret put <NAME> -c server/wrangler.toml`.

---

## Deployment

```bash
./scripts/deploy.sh
```

Builds into `web_dist/`, copies the security headers in, and runs
`wrangler deploy`. The Worker (`johnyos`) serves the static bundle and handles
`/api/auth/line-callback`; unknown paths fall through to `index.html` so React
Router can route them.

---

## LINE Bot Integration

> Repository: `johny-line-bot` — Cloudflare Workers + Hono

### Architecture: LINE ↔ Supabase

```
LINE User A ──LINE Login──► Supabase Auth (uuid-A)
LINE User B ──LINE Login──► Supabase Auth (uuid-B)
                                    │
                          line_users table
              ┌───────────────┬──────────┬──────┐
              │ line_user_id  │ user_id  │ plan │
              ├───────────────┼──────────┼──────┤
              │ Uaaa…         │ uuid-A   │ free │
              │ Ubbb…         │ uuid-B   │ pro  │
              └───────────────┴──────────┴──────┘
```

**ข้อมูลแยกกันโดย `user_id` — ไม่มีทางปนกัน**

- LINE bot กรองทุก query ด้วย `?user_id=eq.<uuid>` (service role key)
- Web app ป้องกันด้วย Supabase RLS policy (JWT)
- 1 LINE account ↔ 1 Supabase account เท่านั้น
- เชื่อมบัญชีอัตโนมัติผ่าน **LINE Login** บนเว็บ (ไม่ต้องกรอกรหัส 6 หลักแล้ว)

### LINE Bot Commands

| คำสั่ง | ผล |
|---|---|
| `+งาน [ชื่องาน]` | เพิ่มงานใหม่ลง Supabase |
| `งานค้าง` / `งานเสร็จ` | ดูสถานะงาน |
| `จ่าย [ชื่อ] [จำนวน]` | บันทึกรายจ่าย (auto-detect หมวด) |
| `รายจ่าย` / `รายจ่ายเดือนนี้` | ดูสรุปรายจ่าย |
| `บันทึก [ข้อความ]` | บันทึกโน้ต |
| `โน้ต` | ดูโน้ตทั้งหมด |
| `คำสั่ง` | แสดงรายการคำสั่งทั้งหมด |

### Stack

```
LINE Messaging API → Cloudflare Worker (Hono) → Supabase REST API
                                │
                         Cloudflare KV
                    (link codes + unlinked notes)
```

---

## Roadmap

### Phase 2 — Cloud & Integrations ✅ (mostly done)
- ✅ **Cloud sync** via Supabase (LINE Login auth + multi-device)
- ✅ **LINE Secretary** — create tasks, log expenses, take notes via LINE
- ✅ **User plans** — free / pro tiers (`line_users.plan`)
- 🔜 **AI assistant** — daily planning, task prioritization, expense analysis

### Phase 3 — Scale
- OCR receipt scanning
- Advanced analytics
- Mobile app
- Multi-user / SaaS

---

## Development Notes

- Understand existing code before editing — avoid unnecessary rewrites
- `src/lib/storage.js` is the only place that touches persistence; keep data shape backward-compatible
- Design consistency matters — `docs/DESIGN.md` is the source of truth before touching any UI
- Guest mode must stay fully functional (ephemeral, no cloud writes)
- AI agents read `AGENTS.md` (design rules) before touching UI

---

## License

Personal project — all rights reserved.
