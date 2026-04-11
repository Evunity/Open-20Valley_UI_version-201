import type { DateTimeFormat } from "@/contexts/PlatformSettingsContext";

const originalToLocaleString = Date.prototype.toLocaleString;
const originalToLocaleDateString = Date.prototype.toLocaleDateString;
const originalToLocaleTimeString = Date.prototype.toLocaleTimeString;

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

export function formatPlatformDate(input: string | number | Date, timezone: string, format: DateTimeFormat): string {
  return formatPlatformDateTime(input, timezone, format).split(" ")[0];
}

export function formatPlatformTime(input: string | number | Date, timezone: string): string {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "Invalid time";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

export function applyGlobalDateFormatting(timezone: string, format: DateTimeFormat) {
  Date.prototype.toLocaleString = function toLocaleStringPatched() {
    return formatPlatformDateTime(this, timezone, format);
  };
  Date.prototype.toLocaleDateString = function toLocaleDateStringPatched() {
    return formatPlatformDate(this, timezone, format);
  };
  Date.prototype.toLocaleTimeString = function toLocaleTimeStringPatched() {
    return formatPlatformTime(this, timezone);
  };
}

export function resetGlobalDateFormatting() {
  Date.prototype.toLocaleString = originalToLocaleString;
  Date.prototype.toLocaleDateString = originalToLocaleDateString;
  Date.prototype.toLocaleTimeString = originalToLocaleTimeString;
}
