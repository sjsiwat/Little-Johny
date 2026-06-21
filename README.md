# Little Johny

> Personal Digital Workspace + Productivity System

A lightweight personal operating system built as a fast static web application.

🌐 Live Demo

https://johny.siwat.me


---

## Overview

Little Johny is a personal digital workspace designed to help manage daily life, productivity, and personal information in one place.

The concept is inspired by:

- Notion
- Todoist
- Google Calendar
- Personal Finance Apps

The goal is to create a **Digital Second Brain** that helps users:

- Think
- Plan
- Remember
- Track
- Improve


---

## Current Status

## Phase 1 — Completed

The first version focuses on a lightweight, privacy-friendly browser experience.

### Implemented

- Personal dashboard
- Task management
- Notes system
- Expense tracker
- Light / Dark theme
- Responsive design
- Local browser storage
- Progressive Web App support
- Offline cache support
- Web manifest
- Custom favicon


---

# Features


## Dashboard

Personal productivity overview.

Includes:

- Task summary
- Recent notes
- Expense overview
- Quick actions
- Empty states
- Demo data


## Task Management

Manage daily tasks.

Features:

- Create tasks
- Edit tasks
- Delete tasks
- Task completion
- Priority levels
- Due dates


## Notes

Personal knowledge storage.

Features:

- Create notes
- Store ideas
- Organize information
- Tag system


## Expense Tracker

Track personal spending.

Features:

- Expense categories
- Spending records
- Simple summaries
- Personal finance overview


## Personalization

Supported:

- Light mode
- Dark mode
- Responsive layout


## PWA

Progressive Web App features:

- Installable web app
- Offline cache
- App icon
- Web manifest


---

# Technology Stack


## Frontend

- HTML5
- CSS3
- JavaScript


## Storage

Browser:

- LocalStorage


## Deployment

Hosting:

- Cloudflare Pages


## Development Tools

AI assisted development:

- Claude
- Codex
- Impeccable UI Agent


---

# Project Structure


```text
Little Johny/

├── index.html
├── app.js
├── styles.css
│
├── icon.svg
├── manifest.webmanifest
├── sw.js
├── _headers
│
├── product.md
├── design.md
├── README.md
│
├── .agents/
│   └── skills/
│       └── impeccable/
│           ├── agents/
│           ├── reference/
│           ├── scripts/
│           └── skill.md
│
├── .claude/
├── .codex/
└── .impeccable/

```
## Local Development

Clone repository:  git clone <repository-url>

## Open project: 
cd "Little Johny"

## Run local server:
python3 -m http.server 8080

## Open browser:
http://localhost:8080

## Deployment Workflow
Local Development

        ↓

     Git Commit

        ↓

      GitHub

        ↓

 Cloudflare Pages

        ↓

 johny.siwat.me

 ## Documentation

Product Requirements

## Product vision and system goals:
product.md
Contains:

* Project vision
* Feature planning
* Future roadmap
* System direction

## Design System

UI/UX guidelines: design.md
Contains:

* Visual direction
* UI principles
* Design rules
* Experience goals

## AI Development Rules

AI instructions: .agents/skills/impeccable/

Contains:

* UX/UI rules
* Design review process
* Frontend quality guidelines

##  Development Philosophy

This project follows:

* Modular structure
* Reusable code
* Clean architecture
* Responsive first
* Performance focused
* Privacy focused

AI developers should:

* Understand existing code before editing
* Avoid unnecessary rewrites
* Maintain design consistency
* Prefer simple solutions

## Roadmap

Phase 2

Planned features:

Cloud Sync

* Supabase database
* User authentication
* Multi-device sync

LINE Secretary

* LINE Messaging API
* Task creation
* Reminder notifications
* Expense recording

AI Assistant

Examples:

* Daily planning
* Task prioritization
* Expense analysis
* Personal insights

⸻

Phase 3

Future:

* OCR receipt scanning
* Advanced analytics
* Mobile application
* Multi-user support
* SaaS expansion

⸻

## Vision

Little Johny aims to become:

A personal operating system for everyday life.

A single place to manage:

* Work
* Ideas
* Knowledge
* Finance
* Goals

⸻

## License

Personal project
