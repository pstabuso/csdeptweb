export function formatDateTime(value: Date | string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Manila",
  }).format(new Date(value));
}

export function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeZone: "Asia/Manila",
  }).format(new Date(value));
}

export function formatTime(value: Date | string) {
  return new Intl.DateTimeFormat("en-PH", {
    timeStyle: "short",
    timeZone: "Asia/Manila",
  }).format(new Date(value));
}

export function formatTimeRange(start: Date | string, end: Date | string) {
  return `${formatTime(start)} to ${formatTime(end)}`;
}

export function formatMonthLabel(month: string) {
  const [year, monthPart] = month.split("-");
  const date = new Date(`${year}-${monthPart}-01T00:00:00+08:00`);

  return new Intl.DateTimeFormat("en-PH", {
    month: "long",
    year: "numeric",
    timeZone: "Asia/Manila",
  }).format(date);
}

export function formatRoleLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatActionLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
