# CS Department Support Portal

A Next.js and Prisma starter for a Vercel-deployed concern-management system for a school's Computer Science department.

## Roles included

- `student`: logs in, submits concerns, and reads staff replies
- `coordinator`: reviews all concerns and responds from the staff queue
- `secretary`: reviews all concerns and responds from the staff queue
- `admin`: sees platform-wide activity, user distribution, and concern metrics

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

- Students can submit a concern with a subject, category, and description
- Coordinators and secretaries share a response queue and can update concern status
- Admins can monitor total users, concern counts, and the latest audit activity
- The login page requires users to choose the role they are signing in as
- All successful logins, concern submissions, and staff replies are recorded in the audit log

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
