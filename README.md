# CS Department Support Portal

A Next.js and Prisma starter for a Vercel-deployed concern-management system for a school's Computer Science department.

## Roles included

| Role | Handles | Calendar |
| --- | --- | --- |
| `student` | Submits concerns, follows up on replies, closes resolved concerns | View |
| `coordinator` | Thesis Consultation, Grade/INC Completion, Readmission | View |
| `secretary` | COR Revision, Others | **Manage** |
| `admin` | Accounts, read-only oversight of every concern, activity log | View |

Staff can open and answer any concern. Their queue simply defaults to
**My categories → Needs reply** so each role sees its own work first. The
category split lives in `STAFF_CATEGORY_OWNERSHIP` in `src/lib/constants.ts`.

## Routes

| Path | What it is |
| --- | --- |
| `/student` | Overview: new replies, waiting concerns, upcoming schedule, student-number setup |
| `/student/concerns` | Active / closed / all concerns (new staff replies first) |
| `/student/concerns/new` | Submit a concern |
| `/student/concerns/[id]` | Conversation, follow-up form, "Mark as resolved" |
| `/student/calendar` | Department calendar |
| `/coordinator`, `/secretary` | Paginated concern queue with status counts, search, type filter and sort |
| `/coordinator/concerns/[id]`, `/secretary/concerns/[id]` | Thread, reply + status, close/reopen, student's other concerns |
| `/coordinator/calendar`, `/secretary/calendar` | Calendar (secretary can add, edit, delete) |
| `/admin` | Overview: concern counts, open load per staff role, people, recent activity |
| `/admin/users` | Search and filter accounts, edit name / email / role / access |
| `/admin/concerns`, `/admin/concerns/[id]` | Read-only queue and threads |
| `/admin/calendar`, `/admin/activity` | Calendar and paginated audit log |
| `/profile` | Name and password |

## Concern lifecycle

```
Student submits ──► OPEN ("Needs reply")
Staff replies   ──► ANSWERED (default) / stays OPEN / CLOSED
Student follows up ──► back to OPEN
Student "Mark as resolved" or staff "Close" ──► CLOSED
Staff "Reopen" ──► OPEN
```

## Authentication flow

- Students can create their own account from `/sign-up`
- New self-registered accounts are automatically assigned the `student` role
- Coordinator, secretary, and admin accounts remain department-managed

## Tech stack

- Next.js 16 App Router
- Prisma ORM with PostgreSQL
- Secure email/password login using hashed passwords and signed cookie sessions
- Tailwind CSS 4 for the UI

## Environment setup

Create a local `.env` file from `.env.example` and fill in:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/cs_department_portal?sslmode=require"
AUTH_SECRET="replace-with-a-long-random-string"
ADMIN_NAME="Your Admin Name"
ADMIN_EMAIL="your-admin@csdept.edu"
ADMIN_PASSWORD="replace-with-a-secure-admin-password"
```

Recommended database options for Vercel:

- Vercel Postgres
- Neon Postgres
- Supabase Postgres

## Local development

Install dependencies:

```bash
npm install
```

Push the Prisma schema to your database:

```bash
npm run db:push
```

Seed demo users and example concerns:

```bash
npm run db:seed
```

Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo accounts

After seeding, these accounts all use the same password unless you override the
admin credentials through environment variables:

- Password: `Password123!`
- Student: `student@csdept.edu`
- Coordinator: `coordinator@csdept.edu`
- Secretary: `secretary@csdept.edu`
- Admin: `admin@csdept.edu` or your `ADMIN_EMAIL` value

## What the system does

- Students submit a concern with a type, subject and details, then hold a two-way conversation with staff on the concern page
- Coordinators and secretaries work from a paginated queue split by category ownership, with "Student followed up" and "New" indicators
- Every form reports success or what went wrong via a notice banner (`src/lib/notices.ts`)
- The secretary maintains the department calendar; everyone else can view it
- Admins manage accounts and review all concerns and the audit log
- Logins, concern submissions, replies, follow-ups, close/reopen, calendar changes and account edits are recorded in the audit log

## Design system

Tokens and component classes live in `src/app/globals.css`: one dark canvas,
two surface levels (`bg-surface`, `bg-raised`), `ink` text colours, a single
violet accent, and classes such as `card`, `btn-primary`, `btn-secondary`,
`input`, `label`, `chip`. Status colours (amber / emerald / grey) are reserved
for concern status. Shared building blocks are in `src/components/ui/`.

## Vercel deployment notes

1. Push this project to GitHub.
2. Import the repository into Vercel.
3. Add `DATABASE_URL` and `AUTH_SECRET` in the Vercel project environment variables.
4. Run `npm run db:push` against the production database at least once.
5. Optionally run `npm run db:seed` against the production database if you want the demo data there too.
6. Redeploy the app.

## Useful scripts

```bash
npm run dev
npm run lint
npm run db:push
npm run db:seed
npm run db:studio
```
