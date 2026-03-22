// Formatting helpers used across the frontend (dates and ranges).

// Format ISO date to short string according to locale ('nl' or 'en')
export function formatDateShort(iso: string, lang: string): string {
  try {
    const d = new Date(iso)
    const localeStr = lang === 'en' ? 'en-US' : 'nl-NL'
    return d.toLocaleDateString(localeStr, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch (e) {
    return ''
  }
}

// Compute a date range from events with starttime/endtime
export function computeDateRangeFromEvents(
  events: Array<{ starttime?: string | null; endtime?: string | null }>,
  lang: string
): string {
  if (!events || !events.length) return '/'

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

  if (!times.length) return '/'

  const earliest = new Date(Math.min(...times))
  const latest = new Date(Math.max(...times))
  const sameDay = earliest.toDateString() === latest.toDateString()
  if (sameDay) return formatDateShort(earliest.toISOString(), lang)

  return `${formatDateShort(earliest.toISOString(), lang)} — ${formatDateShort(latest.toISOString(), lang)}`
}

export function formatHTMLText(text: string | null) {
  if (!text) return ''
  return text.replace(/\+/g, '<br>')
}
