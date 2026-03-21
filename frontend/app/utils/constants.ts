// Shared frontend constants and helpers (e.g. placeholder gradients).

export const PLACEHOLDER_GRADIENTS: string[] = [
  // subtle, modern gradients for image placeholders
  'linear-gradient(135deg, rgba(130,36,227,0.12), rgba(255,159,102,0.10))',
  'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(79,70,229,0.06))',
  'linear-gradient(135deg, rgba(16,185,129,0.10), rgba(6,182,212,0.06))',
  'linear-gradient(135deg, rgba(14,165,233,0.10), rgba(124,58,237,0.06))',
  'linear-gradient(135deg, rgba(236,72,153,0.10), rgba(168,85,247,0.06))',
]

export function pickPlaceholderGradient(id?: number): string {
  const fallback = 'linear-gradient(135deg, rgba(130,36,227,0.12), rgba(255,159,102,0.10))'
  const list = Array.isArray(PLACEHOLDER_GRADIENTS) && PLACEHOLDER_GRADIENTS.length ? PLACEHOLDER_GRADIENTS : [fallback]
  if (!list.length) return fallback
  if (id == null || !Number.isInteger(id)) return (list[0] ?? fallback)
  const idx = Math.abs(id) % list.length
  return (list[idx] ?? list[0] ?? fallback)
}
