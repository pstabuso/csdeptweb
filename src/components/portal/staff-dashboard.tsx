import { Concern, ConcernReply, Role, ScheduleEntry, User } from "@prisma/client";

import { ConcernWorkspace } from "@/components/portal/concern-workspace";
import { ScheduleBoard } from "@/components/portal/schedule-board";
import { ConcernFilterState } from "@/lib/dashboard-data";

type StaffConcern = Concern & {
  student: Pick<User, "name" | "email" | "studentNumber">;
  replies: Array<
    ConcernReply & {
      author: Pick<User, "name" | "role">;
    }
  >;
};

type ScheduleRecord = ScheduleEntry & {
  createdBy: Pick<User, "name" | "role">;
};

type StaffDashboardProps = {
  role: "COORDINATOR" | "SECRETARY";
  concerns: StaffConcern[];
  filters: ConcernFilterState;
  categoryOptions: string[];
  concernPath: string;
  concernRedirectTo: string;
  scheduleMonth: string;
  scheduleEntries: ScheduleRecord[];
  previousMonthHref: string;
  nextMonthHref: string;
};

export function StaffDashboard({
  role,
  concerns,
  filters,
  categoryOptions,
  concernPath,
  concernRedirectTo,
  scheduleMonth,
  scheduleEntries,
  previousMonthHref,
  nextMonthHref,
}: StaffDashboardProps) {
  const label = role === Role.COORDINATOR ? "Coordinator" : "Secretary";

  return (
    <div className="space-y-8">
      <ConcernWorkspace
        title={`${label} response queue`}
        concerns={concerns}
        filters={filters}
        categoryOptions={categoryOptions}
        currentPath={concernPath}
        replyRedirectTo={concernRedirectTo}
        persistentParams={{ scheduleMonth }}
        canReply
        emptyMessage="No concerns match the current filter set."
      />

      <ScheduleBoard
        month={scheduleMonth}
        entries={scheduleEntries}
        canManage
        previousMonthHref={previousMonthHref}
        nextMonthHref={nextMonthHref}
        redirectTo={concernRedirectTo}
        title={`${label} calendar`}
      />
    </div>
  );
}
