import { Role } from "@prisma/client";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { ConcernDetailView } from "@/components/portal/concern-detail";
import { requireUser } from "@/lib/auth";
import { getConcernDetail, getStudentConcernHistory } from "@/lib/dashboard-data";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminConcernPage({ params }: PageProps) {
  const user = await requireUser([Role.ADMIN]);
  const { id } = await params;
  const concern = await getConcernDetail(id);

  if (!concern) {
    notFound();
  }

  const history = await getStudentConcernHistory(concern.studentId, concern.id);

  return (
    <AppShell
      user={user}
      title={concern.subject}
      backLink={{ href: "/admin/concerns", label: "All concerns" }}
    >
      <ConcernDetailView
        concern={concern}
        viewer="admin"
        history={history}
        detailBasePath="/admin/concerns"
      />
    </AppShell>
  );
}
