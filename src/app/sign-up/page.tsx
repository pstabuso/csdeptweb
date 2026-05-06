import { redirect } from "next/navigation";

import { SignupForm } from "@/components/auth/signup-form";
import { getRoleHomePath, getSession } from "@/lib/auth";

export default async function SignupPage() {
  const session = await getSession();

  if (session) {
    redirect(getRoleHomePath(session.role));
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(192,132,252,0.18),_transparent_30%),radial-gradient(circle_at_right,_rgba(139,92,246,0.16),_transparent_22%),linear-gradient(135deg,_#0f0918_0%,_#181126_42%,_#221533_100%)] px-4 py-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-md items-center">
        <SignupForm />
      </div>
    </main>
  );
}
