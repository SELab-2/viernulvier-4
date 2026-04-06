// Formatting helpers used across the frontend (dates and ranges).

// Format ISO date to short string according to locale ('nl' or 'en')
export function formatDateShort(
  iso: string,
  lang: string,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" },
): string {
  try {
    const d = new Date(iso);
    const locale = lang === "en" ? "en-GB" : "nl-BE";
    return d.toLocaleDateString(locale, options);
  } catch {
    return "";
  }
}
 
/** Format a month label (e.g. "January") from a "YYYY-MM" key. */
export function formatMonthLabel(monthKey: string, lang: string): string {
  const [y, m] = monthKey.split("-");
  return formatDateShort(
    new Date(parseInt(y ?? "2000"), parseInt(m ?? "1") - 1, 1).toISOString(),
    lang,
    { month: "long" },
  );
}
 
// Compute a date range from events with starttime/endtime
export function computeDateRangeFromEvents(
  events: Array<{ starttime?: string | null; endtime?: string | null }>,
  lang: string,
): string {
  if (!events?.length) return "/";
 
  const times: number[] = [];
  for (const e of events) {
    if (e?.starttime) {
      const t = Date.parse(e.starttime);
      if (!Number.isNaN(t)) times.push(t);
    }
    if (e?.endtime) {
      const t2 = Date.parse(e.endtime);
      if (!Number.isNaN(t2)) times.push(t2);
    }
  }
 
  if (!times.length) return "/";
 
  const earliest = new Date(Math.min(...times));
  const latest   = new Date(Math.max(...times));
  if (earliest.toDateString() === latest.toDateString()) {
    return formatDateShort(earliest.toISOString(), lang);
  }
  return `${formatDateShort(earliest.toISOString(), lang)} — ${formatDateShort(latest.toISOString(), lang)}`;
}
 
export function formatHTMLText(text: string | null): string {
  if (!text) return "";
  return text.replace(/\+/g, "<br>");
}