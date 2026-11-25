import { StaffCalendarPage } from "@/components/portal/staff-pages";

type PageProps = {
  searchParams?: Promise<{ month?: string; notice?: string }>;
};

export default function Page({ searchParams }: PageProps) {
  return <StaffCalendarPage role="SECRETARY" searchParams={searchParams} />;
}
