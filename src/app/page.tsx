import { redirect } from "next/navigation";

import { getRoleHomePath, getSession } from "@/lib/auth";

export default async function Home() {
  const session = await getSession();

  if (session) {
    redirect(getRoleHomePath(session.role));
  }

  redirect("/login");
}
