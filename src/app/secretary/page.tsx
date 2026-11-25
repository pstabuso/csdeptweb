import { StaffQueuePage } from "@/components/portal/staff-pages";

type PageProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default function Page({ searchParams }: PageProps) {
  return <StaffQueuePage role="SECRETARY" searchParams={searchParams} />;
}
