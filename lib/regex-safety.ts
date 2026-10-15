export const REGEX_LIMITS = { pattern: 500, text: 100_000, matches: 500, timeoutMs: 300 } as const

export function validateRegexInput(pattern: string, text: string) {
  if (pattern.length > REGEX_LIMITS.pattern) return `A expressão está limitada a ${REGEX_LIMITS.pattern} caracteres.`
  if (text.length > REGEX_LIMITS.text) return `O texto está limitado a ${REGEX_LIMITS.text.toLocaleString("pt-BR")} caracteres.`
  return null
}

export function isPotentiallyCatastrophic(pattern: string) {
  return /(\([^)]*[+*][^)]*\))[+*{]/.test(pattern) || /(\.\*){2,}|(\.\+){2,}/.test(pattern)
}
