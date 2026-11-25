import { Role } from "@prisma/client";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { ConcernDetailView } from "@/components/portal/concern-detail";
import { Notice } from "@/components/ui/primitives";
import { requireUser } from "@/lib/auth";
import { getConcernDetail } from "@/lib/dashboard-data";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ notice?: string }>;
};

export default async function StudentConcernPage({ params, searchParams }: PageProps) {
  const user = await requireUser([Role.STUDENT]);
  const { id } = await params;
  const { notice } = (await searchParams) ?? {};
  const concern = await getConcernDetail(id);

  // Students may only read their own concerns. Treat others as missing.
  if (!concern || concern.studentId !== user.id) {
    notFound();
  }

  return (
    <AppShell
      user={user}
      title={concern.subject}
      backLink={{ href: "/student/concerns", label: "My concerns" }}
    >
      <div className="space-y-4">
        <Notice code={notice} />
        <ConcernDetailView concern={concern} viewer="student" detailBasePath="/student/concerns" />
      </div>
    </AppShell>
  );
}
