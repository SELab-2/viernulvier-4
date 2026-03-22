// Formatting helpers used across the frontend (dates and ranges).

// Format ISO date to short NL string (e.g. "21 mrt. 2026").
export function formatDateShortNL(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch (e) {
    return ''
  }
}

// Compute a human-friendly date range from events with starttime/endtime.
export function computeDateRangeFromEvents(events: Array<{ starttime?: string | null; endtime?: string | null }>): string {
  if (!events || !events.length) return 'TBA'
  const times: number[] = []
  for (const e of events) {
    if (e?.starttime) {
      const t = Date.parse(e.starttime)
      if (!Number.isNaN(t)) times.push(t)
    }
    if (e?.endtime) {
      const t2 = Date.parse(e.endtime)
      if (!Number.isNaN(t2)) times.push(t2)
    }
  }
  if (!times.length) return 'TBA'
  const earliest = new Date(Math.min(...times))
  const latest = new Date(Math.max(...times))
  const sameDay = earliest.toDateString() === latest.toDateString()
  if (sameDay) return formatDateShortNL(earliest.toISOString())
  return `${formatDateShortNL(earliest.toISOString())} — ${formatDateShortNL(latest.toISOString())}`
}

export function formatHTMLText(text: string | null) {
  if (!text) return ''
  return text.replace(/\+/g, '<br>')
}
