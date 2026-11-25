import { StaffConcernPage } from "@/components/portal/staff-pages";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ notice?: string }>;
};

export default function Page({ params, searchParams }: PageProps) {
  return <StaffConcernPage role="COORDINATOR" params={params} searchParams={searchParams} />;
}
