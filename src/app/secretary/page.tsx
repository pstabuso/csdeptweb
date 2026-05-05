import { Role } from "@prisma/client";

import { AppShell } from "@/components/layout/app-shell";
import { StaffDashboard } from "@/components/portal/staff-dashboard";
import { requireUser } from "@/lib/auth";
import { getStaffDashboardData } from "@/lib/dashboard-data";

export default async function SecretaryPage() {
  const user = await requireUser([Role.SECRETARY]);
  const concerns = await getStaffDashboardData();

  return (
    <AppShell
      user={user}
      title="Secretary response queue"
      description="Track student requests, coordinate responses, and maintain clean concern records for the department office."
    >
      <StaffDashboard role={Role.SECRETARY} concerns={concerns} />
    </AppShell>
  );
}

