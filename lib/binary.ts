export function textToBinary(text: string) {
  return Array.from(new TextEncoder().encode(text), (byte) => byte.toString(2).padStart(8, "0")).join(" ")
}

export function binaryToText(binary: string) {
  const normalized = binary.trim().replace(/\s+/g, "")
  if (!normalized) return ""
  if (/[^01]/.test(normalized)) throw new Error("Use somente 0, 1 e espaços.")
  if (normalized.length % 8 !== 0) throw new Error("Cada byte precisa ter exatamente 8 bits.")

  const bytes = new Uint8Array(normalized.length / 8)
  for (let index = 0; index < bytes.length; index++) {
    bytes[index] = Number.parseInt(normalized.slice(index * 8, index * 8 + 8), 2)
  }
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes)
  } catch {
    throw new Error("A sequência não representa texto UTF-8 válido.")
  }
}
