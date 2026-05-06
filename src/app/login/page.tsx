import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { AuthShell } from "@/components/layout/auth-shell";
import { getRoleHomePath, getSession } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect(getRoleHomePath(session.role));
  }

  return (
    <AuthShell
      title="Sign in"
      subtitle="Use your assigned account."
      footerHref="/sign-up"
      footerLabel="Need an account?"
      footerAction="Student sign up"
    >
        <LoginForm />
    </AuthShell>
  );
}
