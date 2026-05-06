import { redirect } from "next/navigation";

import { SignupForm } from "@/components/auth/signup-form";
import { AuthShell } from "@/components/layout/auth-shell";
import { getRoleHomePath, getSession } from "@/lib/auth";

export default async function SignupPage() {
  const session = await getSession();

  if (session) {
    redirect(getRoleHomePath(session.role));
  }

  return (
    <AuthShell
      title="Student sign up"
      subtitle="Create a student account."
      footerHref="/login"
      footerLabel="Already have an account?"
      footerAction="Sign in"
    >
        <SignupForm />
    </AuthShell>
  );
}
