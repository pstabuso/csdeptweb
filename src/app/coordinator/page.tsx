import { Role } from "@prisma/client";

import { AppShell } from "@/components/layout/app-shell";
import { StaffDashboard } from "@/components/portal/staff-dashboard";
import { requireUser } from "@/lib/auth";
import { getStaffDashboardData } from "@/lib/dashboard-data";

export default async function CoordinatorPage() {
  const user = await requireUser([Role.COORDINATOR]);
  const concerns = await getStaffDashboardData();

  return (
    <AppShell
      user={user}
      title="Coordinator response queue"
      description="Review new student concerns, provide official responses, and update statuses so the department queue stays accurate."
    >
      <StaffDashboard role={Role.COORDINATOR} concerns={concerns} />
    </AppShell>
  );
}

