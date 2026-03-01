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

  const weeks = now.diff(then, "week");
  if (weeks < 4) return `${weeks}w`;

  const months = now.diff(then, "month");
  if (months < 12) return `${months}mo`;

  const years = now.diff(then, "year");
  return `${years}y`;
}