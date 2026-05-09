export const MANILA_TIME_ZONE = "Asia/Manila";

const LOCAL_DATE_TIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

export function parseManilaDateTimeLocal(value: string) {
  const match = LOCAL_DATE_TIME_PATTERN.exec(value);

  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute] = match;
  const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:00+08:00`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return formatManilaDateTimeLocalValue(date) === value ? date : null;
}

export function formatManilaDateTimeLocalValue(value: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: MANILA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(value).map((part) => [part.type, part.value]),
  );

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function getManilaDateKey(value: Date | string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: MANILA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(new Date(value)).map((part) => [
      part.type,
      part.value,
    ]),
  );

  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function isSameManilaDate(left: Date, right: Date) {
  return getManilaDateKey(left) === getManilaDateKey(right);
}

export function getManilaMonthRange(month: string) {
  const [year, monthPart] = month.split("-").map(Number);
  const nextMonth = shiftScheduleMonth(month, 1);

  return {
    start: new Date(
      `${year}-${String(monthPart).padStart(2, "0")}-01T00:00:00+08:00`,
    ),
    end: new Date(`${nextMonth}-01T00:00:00+08:00`),
  };
}

export function shiftScheduleMonth(month: string, delta: number) {
  const [year, monthPart] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, monthPart - 1 + delta, 1));

  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(
    2,
    "0",
  )}`;
}

export function getManilaMonthGrid(month: string) {
  const [year, monthPart] = month.split("-").map(Number);
  const firstDay = new Date(Date.UTC(year, monthPart - 1, 1)).getUTCDay();
  const lastDay = new Date(Date.UTC(year, monthPart, 0)).getUTCDate();
  const cells: Array<{ key: string; dayNumber: number | null }> = [];

  for (let index = 0; index < firstDay; index += 1) {
    cells.push({ key: `blank-start-${index}`, dayNumber: null });
  }

  for (let day = 1; day <= lastDay; day += 1) {
    cells.push({
      key: `${month}-${String(day).padStart(2, "0")}`,
      dayNumber: day,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ key: `blank-end-${cells.length}`, dayNumber: null });
  }

  return cells;
}
