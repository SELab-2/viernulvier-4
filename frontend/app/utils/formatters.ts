// Formatting helpers used across the frontend (dates and ranges).

// ISO / date helpers

/** Serialize a Date to a local-timezone YYYY-MM-DD string (no UTC drift). */
export function localIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

/** Return today's date as a local-timezone ISO string. */
export function localTodayIso(): string {
  return localIso(new Date());
}

/**
 * Validate a YYYY-MM-DD string: checks calendar validity and rejects future dates.
 * Returns the ISO string on success, null on failure.
 */
export function validateIso(iso: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  const date = new Date(y, m - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  )
    return null;
  if (iso > localTodayIso()) return null;
  return iso;
}

/**
 * Parse a user-typed date string in DD/MM/YYYY or YYYY-MM-DD format.
 * Returns a validated ISO string, or null if unparseable / invalid.
 */
export function parseDate(raw: string): string | null {
  const val = raw.replace(/[^\d\/\-\.]/g, "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return validateIso(val);
  const parts = val.split(/[\/\-\.]/);
  if (parts.length === 3) {
    const [dd, mm, yyyy] = parts;
    if (yyyy?.length === 4 && dd && mm)
      return validateIso(
        `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`,
      );
  }
  return null;
}

/** Format an ISO string as DD/MM/YYYY for display in text inputs. */
export function formatForInput(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

// Locale / label helpers

/** Produce 7 narrow weekday labels (Mon → Sun) for a given locale. */
export function buildWeekdayLabels(intlLocale: string): string[] {
  const mon = new Date(2024, 0, 1); // 1 Jan 2024 is a known Monday
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon);
    d.setDate(1 + i);
    return d.toLocaleDateString(intlLocale, { weekday: "narrow" });
  });
}

// Format ISO date to short string according to locale ('nl' or 'en')
export function formatDateShort(
  iso: string,
  lang: string,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  },
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
  const latest = new Date(Math.max(...times));
  if (earliest.toDateString() === latest.toDateString()) {
    return formatDateShort(earliest.toISOString(), lang);
  }
  return `${formatDateShort(earliest.toISOString(), lang)} — ${formatDateShort(latest.toISOString(), lang)}`;
}

export function formatHTMLText(text: string | null): string {
  if (!text) return "";
  return text.replace(/\+/g, "<br>");
}

/**
 * Format a date string to a localized time string.
 * @param dateStr - ISO date string
 * @param locale - Locale code (e.g., 'en-GB', 'nl-BE')
 */
export function formatTime(dateStr: string, locale: string): string {
  return new Date(dateStr).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format a price as a localized currency string (EUR).
 * @param price - Price amount
 * @param locale - Locale code (e.g., 'en-GB', 'nl-BE')
 */
export function formatPrice(price: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

/**
 * Format a url using relative pathing or absolute.
 * note in case of relative pathing the MEDIA_BASE_URL will be appended infront of it.
 * @param url is the url in relative or absolute pathing
 * @returns a valid url you can use to fetch/delete/put anything.
 */
export function formatUrl(url: string): string {
  const config = useRuntimeConfig();
  const baseUrl = config.public.mediaBaseUrl as string;

  if (url.startsWith("http")) {
    return url;
  }
  return `${baseUrl}${url}`;
}
