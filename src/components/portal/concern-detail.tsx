import { ConcernStatus, Role } from "@prisma/client";
import Link from "next/link";

import {
  ConcernStatusButton,
  StaffReplyForm,
  StudentFollowUpForm,
} from "@/components/portal/reply-form";
import { StatusBadge } from "@/components/portal/status-badge";
import { getCategoryOwner } from "@/lib/constants";
import { cx } from "@/lib/cx";
import type { ConcernDetail } from "@/lib/dashboard-data";
import { formatDateTime, formatRelative, formatRoleLabel } from "@/lib/format";

type Viewer = "student" | "staff" | "admin";

type HistoryItem = {
  id: string;
  subject: string;
  status: ConcernStatus;
  category: string;
  createdAt: Date;
};

type ThreadMessage = {
  id: string;
  authorName: string;
  authorRole: Role;
  body: string;
  createdAt: Date;
  isOriginal: boolean;
};

function buildThread(concern: ConcernDetail): ThreadMessage[] {
  return [
    {
      id: `${concern.id}-original`,
      authorName: concern.student.name,
      authorRole: Role.STUDENT,
      body: concern.message,
      createdAt: concern.createdAt,
      isOriginal: true,
    },
    ...concern.replies.map((reply) => ({
      id: reply.id,
      authorName: reply.author.name,
      authorRole: reply.author.role,
      body: reply.message,
      createdAt: reply.createdAt,
      isOriginal: false,
    })),
  ];
}

function Thread({ concern, viewer }: { concern: ConcernDetail; viewer: Viewer }) {
  const messages = buildThread(concern);

  return (
    <ol className="space-y-3" aria-label="Conversation">
      {messages.map((message) => {
        const fromStudent = message.authorRole === Role.STUDENT;
        const isViewer = viewer === "student" && fromStudent;

        return (
          <li
            key={message.id}
            className={cx(
              "rounded-xl border p-4",
              fromStudent
                ? "border-line bg-surface"
                : "border-violet-400/20 bg-violet-500/[0.06]",
            )}
          >
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              <span className="font-medium text-ink">
                {isViewer ? "You" : message.authorName}
              </span>
              <span className={fromStudent ? "chip" : "chip-accent"}>
                {formatRoleLabel(message.authorRole)}
              </span>
              <time
                className="text-xs text-ink-faint"
                dateTime={message.createdAt.toISOString()}
                title={formatDateTime(message.createdAt)}
              >
                {formatRelative(message.createdAt)}
              </time>
              {message.isOriginal ? (
                <span className="text-xs text-ink-faint">· original concern</span>
              ) : null}
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink">
              {message.body}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 text-sm">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-right text-ink">{children}</dd>
    </div>
  );
}

export function ConcernDetailView({
  concern,
  viewer,
  history = [],
  detailBasePath,
}: {
  concern: ConcernDetail;
  viewer: Viewer;
  history?: HistoryItem[];
  detailBasePath: string;
}) {
  const isClosed = concern.status === ConcernStatus.CLOSED;
  const audience = viewer === "student" ? "student" : "staff";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0 space-y-4">
        <Thread concern={concern} viewer={viewer} />

        {viewer === "staff" ? (
          <StaffReplyForm concernId={concern.id} currentStatus={concern.status} />
        ) : null}

        {viewer === "student" && !isClosed ? (
          <StudentFollowUpForm concernId={concern.id} />
        ) : null}

        {viewer === "student" && isClosed ? (
          <p className="rounded-xl border border-dashed border-line-strong px-4 py-3 text-sm text-ink-muted">
            This concern is closed. If you still need help,{" "}
            <Link href="/student/concerns/new" className="text-violet-300 hover:text-violet-200">
              submit a new concern
            </Link>
            .
          </p>
        ) : null}
      </div>

      <aside className="space-y-4">
        <section className="card card-pad">
          <h2 className="text-sm font-semibold text-ink">Details</h2>
          <dl className="mt-2 divide-y divide-line">
            <DetailRow label="Status">
              <StatusBadge status={concern.status} audience={audience} />
            </DetailRow>
            <DetailRow label="Type">{concern.category}</DetailRow>
            <DetailRow label="Handled by">
              {formatRoleLabel(getCategoryOwner(concern.category))}
            </DetailRow>
            <DetailRow label="Submitted">{formatDateTime(concern.createdAt)}</DetailRow>
            <DetailRow label="Last update">{formatRelative(concern.updatedAt)}</DetailRow>
          </dl>

          {viewer === "staff" ? (
            <div className="mt-4 border-t border-line pt-4">
              {isClosed ? (
                <ConcernStatusButton
                  concernId={concern.id}
                  nextStatus="OPEN"
                  label="Reopen concern"
                  className="w-full"
                />
              ) : (
                <ConcernStatusButton
                  concernId={concern.id}
                  nextStatus="CLOSED"
                  label="Close without reply"
                  className="w-full"
                />
              )}
            </div>
          ) : null}

          {viewer === "student" && !isClosed ? (
            <div className="mt-4 border-t border-line pt-4">
              <ConcernStatusButton
                concernId={concern.id}
                nextStatus="CLOSED"
                label="Mark as resolved"
                className="w-full"
              />
              <p className="hint mt-2">Close this if staff have fully helped you.</p>
            </div>
          ) : null}
        </section>

        {viewer !== "student" ? (
          <section className="card card-pad">
            <h2 className="text-sm font-semibold text-ink">Student</h2>
            <dl className="mt-2 divide-y divide-line">
              <DetailRow label="Name">{concern.student.name}</DetailRow>
              <DetailRow label="Number">{concern.student.studentNumber || "Not set"}</DetailRow>
              <DetailRow label="Email">
                <a
                  href={`mailto:${concern.student.email}`}
                  className="break-all text-violet-300 hover:text-violet-200"
                >
                  {concern.student.email}
                </a>
              </DetailRow>
            </dl>

            {history.length ? (
              <div className="mt-4 border-t border-line pt-3">
                <h3 className="text-xs font-medium text-ink-muted">Other concerns</h3>
                <ul className="mt-2 space-y-1">
                  {history.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`${detailBasePath}/${item.id}`}
                        className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-raised"
                      >
                        <span className="truncate text-ink">{item.subject}</span>
                        <StatusBadge status={item.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        ) : null}
      </aside>
    </div>
  );
}
