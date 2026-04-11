import type { DateTimeFormat } from "@/contexts/PlatformSettingsContext";

export function formatPlatformDateTime(
  input: string | number | Date,
  timezone: string,
  format: DateTimeFormat,
): string {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "Invalid date";

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const yyyy = map.year;
  const mm = map.month;
  const dd = map.day;
  const hh = map.hour;
  const min = map.minute;
  const ss = map.second;

  if (format === "european") return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
  if (format === "us") return `${mm}/${dd}/${yyyy} ${hh}:${min}:${ss}`;
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

