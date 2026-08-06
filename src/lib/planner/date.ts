import { SEOUL_TIME_ZONE } from "@/lib/planner/constants";

function getSeoulDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: SEOUL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
  };
}

export function getSeoulDateString(date = new Date()) {
  const { day, month, year } = getSeoulDateParts(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function formatPlannerDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return `${String(year).slice(-2)}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")}`;
}

export function formatKoreanDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return `${year}. ${month}. ${day}`;
}

export function getMonthRange(dateString: string) {
  const [year, month] = dateString.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const prefix = `${year}-${String(month).padStart(2, "0")}`;

  return {
    start: `${prefix}-01`,
    end: `${prefix}-${String(lastDay).padStart(2, "0")}`,
  };
}

export function getMillisecondsUntilNextSeoulDay() {
  const now = new Date();
  const { day, month, year } = getSeoulDateParts(now);
  const nextMidnightUtc = Date.UTC(year, month - 1, day + 1) - 9 * 60 * 60 * 1000;

  return Math.max(nextMidnightUtc - now.getTime(), 1_000);
}
