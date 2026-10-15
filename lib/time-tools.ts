const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^(?:[01]\d|2[0-3]):[0-5]\d$/

function localDate(value: string) {
  if (!DATE_RE.test(value)) throw new Error("Informe uma data válida.")
  const [year, month, day] = value.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    throw new Error("Informe uma data válida.")
  }
  return date
}

function nextBusinessDay(date: Date) {
  const next = new Date(date)
  do next.setDate(next.getDate() + 1)
  while (next.getDay() === 0 || next.getDay() === 6)
  return next
}

function normalizeBusinessDay(date: Date) {
  let normalized = new Date(date)
  while (normalized.getDay() === 0 || normalized.getDay() === 6) normalized = nextBusinessDay(normalized)
  return normalized
}

export function calculateCompletionDate(start: string, totalHours: number, hoursPerDay: number) {
  if (!Number.isFinite(totalHours) || totalHours <= 0) throw new Error("As horas totais devem ser maiores que zero.")
  if (!Number.isFinite(hoursPerDay) || hoursPerDay <= 0 || hoursPerDay > 24) {
    throw new Error("A jornada diária deve estar entre 0 e 24 horas.")
  }

  let date = normalizeBusinessDay(localDate(start))
  let remaining = totalHours
  while (remaining > hoursPerDay) {
    remaining -= hoursPerDay
    date = nextBusinessDay(date)
  }
  return { date, hoursIntoDay: remaining, businessDays: Math.ceil(totalHours / hoursPerDay) }
}

function minutesFromTime(value: string) {
  if (!TIME_RE.test(value)) throw new Error("Use um horário válido no formato HH:mm.")
  const [hours, minutes] = value.split(":").map(Number)
  return hours * 60 + minutes
}

export function calculateWorkedTime(entry: string, exit: string, breakMinutes: number) {
  const start = minutesFromTime(entry)
  let end = minutesFromTime(exit)
  if (end <= start) end += 24 * 60
  const elapsed = end - start
  if (!Number.isFinite(breakMinutes) || breakMinutes < 0 || breakMinutes >= elapsed) {
    throw new Error("O intervalo deve ser menor que o período trabalhado.")
  }
  const netMinutes = elapsed - breakMinutes
  return { netMinutes, decimalHours: netMinutes / 60, overnight: end >= 24 * 60 }
}
