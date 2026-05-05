import Link from "next/link";
import { redirect } from "next/navigation";

import { SignupForm } from "@/components/auth/signup-form";
import { getRoleHomePath, getSession } from "@/lib/auth";

export default async function SignupPage() {
  const session = await getSession();

  if (session) {
    redirect(getRoleHomePath(session.role));
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.16),_transparent_26%),radial-gradient(circle_at_right,_rgba(34,197,94,0.14),_transparent_22%),linear-gradient(135deg,_#030712_0%,_#07111d_48%,_#0b1624_100%)] px-6 py-10 lg:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl gap-8 lg:grid-cols-[1fr_440px]">
        <section className="rounded-[2.5rem] border border-white/70 bg-slate-950 px-8 py-10 text-white shadow-[0_24px_120px_-60px_rgba(15,23,42,0.6)] lg:px-10 lg:py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-300">
            Student registration
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl">
            Give students a direct way to join the department support portal.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
            Students can register their own account, sign in immediately, and start
            submitting concerns without waiting for a manual setup request.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.8rem] bg-white/10 p-5">
              <p className="text-sm font-semibold text-white">Student-only self sign-up</p>
              <p className="mt-2 text-sm leading-7 text-slate-200">
                New registrations are automatically assigned the Student role.
              </p>
            </div>
            <div className="rounded-[1.8rem] bg-white/10 p-5">
              <p className="text-sm font-semibold text-white">Protected staff roles</p>
              <p className="mt-2 text-sm leading-7 text-slate-200">
                Coordinator, secretary, and admin accounts stay department-managed.
              </p>
            </div>
          </div>

          <p className="mt-8 text-sm text-slate-300">
            Staff member instead?{" "}
            <Link className="font-semibold text-emerald-300 hover:text-emerald-200" href="/login">
              Return to sign in
            </Link>
          </p>
        </section>

        <div className="flex items-center">
          <SignupForm />
        </div>
      </div>
    </main>
  );
}
