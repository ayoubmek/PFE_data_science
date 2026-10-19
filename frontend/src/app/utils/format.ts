export const fmt = (n: number | null | undefined, digits = 0): string =>
  n === null || n === undefined || Number.isNaN(Number(n))
    ? '—'
    : Number(n).toLocaleString('fr-FR', { maximumFractionDigits: digits })

export const fmtDate = (iso?: string | null): string => (iso ? new Date(iso).toLocaleDateString('fr-FR') : '—')

export const fmtIsoDay = (iso?: string | null): string => (iso ? iso.slice(0, 10).split('-').reverse().join('/') : '—')

export const fmtThousands = (v: number): string => `${Math.round(v / 1000)}k`
