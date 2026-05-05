import { redirect } from "next/navigation";

import { getRoleHomePath, requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireUser();
  redirect(getRoleHomePath(user.role));
}

