# Little Johny (JohnyMemo)

> A personal digital workspace — tasks, notes, expenses, calendar, and daily review in one place, with a LINE secretary in your pocket.

**Live:** [johny.siwat.me](https://johny.siwat.me) &nbsp;|&nbsp; **Stack:** Vanilla JS · Supabase · LINE Login · Cloudflare Workers

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
| **UI** | Warm paper workspace, no dark shell, one accent blue (see `DESIGN.md`) · FAB quick actions · Fully responsive |

---

## Architecture

```
                    ┌─────────────────────────────┐
                    │   johny.siwat.me            │
                    │   Cloudflare Worker         │
                    │   (worker.js + static assets)│
                    └──────┬──────────────┬───────┘
                           │              │
              /api/auth/line-callback   everything else
                           │              │
                     LINE Login      index.html + app.js
                     OAuth 2.1       auth.js / storage.js
                           │         fab.js / mascot.js
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

### Storage layer (`storage.js`)

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

```
little-johny/
├── index.html               # Single-page app shell (all views)
├── app.js                   # App logic: views, tasks, notes, expenses, calendar, review
├── auth.js                  # Supabase auth wrapper + LINE Login OAuth
├── storage.js               # Unified storage adapter (LocalStorage ↔ Supabase)
├── fab.js                   # Floating action button menu
├── mascot.js                # Johny Buddy — animated desk companion
├── mascot/                  # Mascot pose frames (idle, wave, happy, typing, thinking, sleeping)
├── styles.css               # Full design system implementation
├── sw.js                    # Service worker (offline cache)
├── manifest.webmanifest     # PWA manifest ("Johny Memo")
├── worker.js                # Cloudflare Worker entry: LINE callback + static assets
├── wrangler.toml            # Worker config (name: johnyos)
├── functions/               # Cloudflare Pages Functions (LINE callback, legacy)
├── supabase_migration_*.sql # DB migrations (line_users, plans, task progress)
├── _headers                 # Security headers
│
├── PRODUCT.md               # Vision, features, roadmap
├── DESIGN.md                # Design system — source of truth for all UI
│
└── .claude/skills/impeccable/  # AI dev rules (UX review, frontend quality)
```

---

## Local Development

```bash
git clone <repository-url>
cd little-johny

# Static-only (no LINE login):
python3 -m http.server 8080     # → http://localhost:8080

# Full stack incl. LINE callback:
wrangler dev                    # runs worker.js + assets
```

No build step. No dependencies. Environment variables for the Worker are documented in `.env.example` (LINE channel secret, Supabase service role key — set as Wrangler secrets; public vars live in `wrangler.toml`).

---

## Deployment

```
Local → Git commit → GitHub → Cloudflare Worker (wrangler) → johny.siwat.me
```

The Worker (`johnyos`) serves the static app and handles `/api/auth/line-callback`.

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
- `storage.js` is the only place that touches persistence; keep data shape backward-compatible
- Design consistency matters — `DESIGN.md` is the source of truth before touching any UI
- Guest mode must stay fully functional (ephemeral, no cloud writes)
- AI agents follow `.claude/skills/impeccable/` rules for UX quality

---

## License

Personal project — all rights reserved.
