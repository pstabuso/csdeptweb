import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";

export default async function Home() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.2),_transparent_30%),radial-gradient(circle_at_right,_rgba(14,165,233,0.18),_transparent_24%),linear-gradient(135deg,_#f8fbff_0%,_#eef5ff_50%,_#f9fcf8_100%)] px-6 py-10 text-slate-900 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl flex-col justify-between gap-10 rounded-[2.5rem] border border-white/70 bg-white/65 p-8 shadow-[0_24px_120px_-60px_rgba(15,23,42,0.45)] backdrop-blur lg:p-10">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-700">
              Computer Science Department
            </p>
            <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
              A support portal built for student concerns, staff responses, and
              admin visibility.
            </h1>
          </div>
          <a
            href="/login"
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Open the portal
          </a>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="grid gap-6 md:grid-cols-3">
            <article className="rounded-[2rem] border border-white/70 bg-white/85 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
                Students
              </p>
              <h2 className="mt-4 text-xl font-semibold text-slate-950">
                Submit concerns with context
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Students can log in, create concern tickets, and monitor the
                latest department replies in one place.
              </p>
            </article>
            <article className="rounded-[2rem] border border-white/70 bg-white/85 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Coordinator & Secretary
              </p>
              <h2 className="mt-4 text-xl font-semibold text-slate-950">
                Respond from a shared queue
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Department staff can review submissions, reply clearly, and
                update the status of each concern.
              </p>
            </article>
            <article className="rounded-[2rem] border border-white/70 bg-white/85 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-700">
                Admin
              </p>
              <h2 className="mt-4 text-xl font-semibold text-slate-950">
                See all activity
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Administrators get a live overview of users, concern volume, and
                a full audit trail of portal actions.
              </p>
            </article>
          </div>

          <aside className="rounded-[2rem] border border-slate-200/80 bg-slate-950 p-6 text-slate-50">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-300">
              Ready for deployment
            </p>
            <ul className="mt-5 space-y-4 text-sm leading-7 text-slate-200">
              <li>Next.js App Router frontend designed for Vercel deployment.</li>
              <li>Email and password login for student, coordinator, secretary, and admin roles.</li>
              <li>Concern submission, staff response tracking, and admin audit monitoring.</li>
            </ul>
            <div className="mt-8 rounded-[1.5rem] bg-white/10 p-4">
              <p className="text-sm font-medium text-white">Starter demo accounts</p>
              <p className="mt-2 text-sm text-slate-200">
                Seeded accounts are included once the database is connected and
                `npm run db:seed` is executed.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
