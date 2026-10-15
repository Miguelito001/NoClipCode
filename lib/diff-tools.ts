export const DIFF_LIMITS = { chars: 200_000, lines: 2_000, cells: 2_000_000 } as const

export type DiffLine = { type: "same" | "add" | "remove"; content: string; oldLine?: number; newLine?: number }

export function validateDiffInput(left: string, right: string) {
  if (left.length > DIFF_LIMITS.chars || right.length > DIFF_LIMITS.chars) {
    return `Cada texto está limitado a ${DIFF_LIMITS.chars.toLocaleString("pt-BR")} caracteres.`
  }
  const leftLines = left.split("\n").length
  const rightLines = right.split("\n").length
  if (leftLines > DIFF_LIMITS.lines || rightLines > DIFF_LIMITS.lines || leftLines * rightLines > DIFF_LIMITS.cells) {
    return "Os textos têm linhas demais para uma comparação segura no navegador. Reduza o trecho e tente novamente."
  }
  return null
}

export function computeLineDiff(left: string, right: string): DiffLine[] {
  const limitError = validateDiffInput(left, right)
  if (limitError) throw new Error(limitError)
  const a = left.split("\n")
  const b = right.split("\n")
  const matrix = Array.from({ length: a.length + 1 }, () => new Uint16Array(b.length + 1))
  for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--) {
    matrix[i][j] = a[i] === b[j] ? matrix[i + 1][j + 1] + 1 : Math.max(matrix[i + 1][j], matrix[i][j + 1])
  }
  const result: DiffLine[] = []
  let i = 0, j = 0, oldLine = 1, newLine = 1
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) {
      result.push({ type: "same", content: a[i++], oldLine: oldLine++, newLine: newLine++ }); j++
    } else if (j < b.length && (i >= a.length || matrix[i][j + 1] >= matrix[i + 1][j])) {
      result.push({ type: "add", content: b[j++], newLine: newLine++ })
    } else {
      result.push({ type: "remove", content: a[i++], oldLine: oldLine++ })
    }
  }
  return result
}
