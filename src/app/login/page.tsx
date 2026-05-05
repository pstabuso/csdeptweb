import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { getRoleHomePath, getSession } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect(getRoleHomePath(session.role));
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_28%),radial-gradient(circle_at_right,_rgba(14,165,233,0.14),_transparent_24%),linear-gradient(135deg,_#030712_0%,_#081120_48%,_#0c1729_100%)] px-6 py-10 lg:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl gap-8 lg:grid-cols-[1fr_420px]">
        <section className="rounded-[2.5rem] border border-white/70 bg-slate-950 px-8 py-10 text-white shadow-[0_24px_120px_-60px_rgba(15,23,42,0.6)] lg:px-10 lg:py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-300">
            CS Department Support Portal
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl">
            Keep student concerns organized and visible across the department.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
            This starter system includes role-based dashboards for students,
            coordinator, secretary, and admin users. Students file concerns,
            staff reply, and the admin account can review all activity.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.8rem] bg-white/10 p-5">
              <p className="text-sm font-semibold text-white">Recommended seed login</p>
              <p className="mt-2 text-sm leading-7 text-slate-200">
                Run `npm run db:seed` after database setup, then sign in with
                the demo accounts listed in the README.
              </p>
            </div>
            <div className="rounded-[1.8rem] bg-white/10 p-5">
              <p className="text-sm font-semibold text-white">Vercel-friendly stack</p>
              <p className="mt-2 text-sm leading-7 text-slate-200">
                The app is prepared for Vercel deployment with Prisma, Postgres,
                and secure cookie sessions.
              </p>
            </div>
          </div>
        </section>

        <div className="flex items-center">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
