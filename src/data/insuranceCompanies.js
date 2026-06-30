import raw from './insuranceCompanies.txt?raw'

export const INSURANCE_COMPANIES = raw
  .split('\n')
  .map(line => line.trim())
  .filter(Boolean)

export function filterInsuranceCompanies(query, limit = 3) {
  const q = String(query || '').trim().toLowerCase()
  if (!q) return []

  return INSURANCE_COMPANIES
    .filter(name => name.toLowerCase().includes(q))
    .sort((a, b) => {
      const aStarts = a.toLowerCase().startsWith(q)
      const bStarts = b.toLowerCase().startsWith(q)
      if (aStarts !== bStarts) return aStarts ? -1 : 1
      return a.localeCompare(b)
    })
    .slice(0, limit)
}
