const MONTH_NAMES = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

const MONTH_OPTIONS = [2025, 2026, 2027].flatMap((year) =>
  MONTH_NAMES.map((name, i) => ({ value: `${year}-${String(i + 1).padStart(2, '0')}`, label: `${name} ${year}` }))
)

export function ForecastMonthSelect({ value, onChange }: { value: string; onChange: (month: string) => void }) {
  return (
    <select
      className='form-select form-select-solid form-select-sm w-auto'
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value=''>Prochains 30 jours</option>
      {MONTH_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}
