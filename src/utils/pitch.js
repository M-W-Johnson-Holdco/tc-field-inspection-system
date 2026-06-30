export function parsePitchNumerator(value, fallback = 0) {
  const text = String(value || '').trim()
  if (!text) return fallback

  const slashMatch = text.match(/^(\d+(?:\.\d+)?)\s*\/\s*12$/)
  if (slashMatch) return Math.max(0, Math.round(Number(slashMatch[1])))

  const leading = text.match(/^(\d+(?:\.\d+)?)/)
  if (leading) return Math.max(0, Math.round(Number(leading[1])))

  return fallback
}

export function formatPitch(numerator) {
  return `${Math.max(0, Math.round(Number(numerator) || 0))}/12`
}
