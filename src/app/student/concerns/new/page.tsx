import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { StudentConcernForm } from "@/components/portal/student-concern-form";
import { Notice } from "@/components/ui/primitives";
import { requireUser } from "@/lib/auth";
import { withNotice } from "@/lib/notices";

type PageProps = {
  searchParams?: Promise<{ notice?: string }>;
};

export default async function NewConcernPage({ searchParams }: PageProps) {
  const user = await requireUser([Role.STUDENT]);
  const { notice } = (await searchParams) ?? {};

  if (!user.studentNumber) {
    redirect(withNotice("/student", "student-number-required"));
  }

  return (
    <AppShell
      user={user}
      title="New concern"
      description="Choose the type that fits best so it reaches the right staff member."
      backLink={{ href: "/student/concerns", label: "My concerns" }}
    >
      <div className="max-w-3xl space-y-4">
        <Notice code={notice} />
        <StudentConcernForm />
      </div>
    </AppShell>
  );
}
