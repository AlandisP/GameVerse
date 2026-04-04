import dayjs from "dayjs";

export function shortTimeAgo(date) {
  const now = dayjs();
  const then = dayjs(date);

  const seconds = now.diff(then, "second");
  if (seconds < 60) return `${seconds}s`;

  const minutes = now.diff(then, "minute");
  if (minutes < 60) return `${minutes}m`;

  const hours = now.diff(then, "hour");
  if (hours < 24) return `${hours}h`;

  const days = now.diff(then, "day");
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.floor(days / 7)}w`;
  if (days < 365) return `${Math.floor(days / 30)}mo`;

  const years = now.diff(then, "year");
  return `${years}y`
}