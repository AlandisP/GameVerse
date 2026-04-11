import dayjs from "dayjs";

export function shortTimeUntil(date) {
  const now = dayjs();
  const then = dayjs(date);

  const seconds = then.diff(now, "second");
  if (seconds <= 0) return null; // timer expired
  if (seconds < 60) return `${seconds}s`;

  const minutes = then.diff(now, "minute");
  if (minutes < 60) return `${minutes}m`;

  const hours = then.diff(now, "hour");
  if (hours < 24) return `${hours}h`;

  const days = then.diff(now, "day");
  return `${days}d`;
}