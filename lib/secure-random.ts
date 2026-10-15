export const PASSWORD_SETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
} as const

type RandomFill = (array: Uint8Array) => Uint8Array

function defaultRandomFill(array: Uint8Array) {
  return crypto.getRandomValues(array)
}

export function secureRandomInt(max: number, randomFill: RandomFill = defaultRandomFill) {
  if (!Number.isSafeInteger(max) || max <= 0 || max > 256) {
    throw new Error("O limite aleatório deve estar entre 1 e 256.")
  }

  const ceiling = 256 - (256 % max)
  const byte = new Uint8Array(1)
  do randomFill(byte)
  while (byte[0] >= ceiling)
  return byte[0] % max
}

export function generateSecurePassword(
  length: number,
  enabledSets: Array<keyof typeof PASSWORD_SETS>,
  randomFill: RandomFill = defaultRandomFill,
) {
  if (!Number.isSafeInteger(length) || length < 4 || length > 256) {
    throw new Error("O tamanho deve estar entre 4 e 256 caracteres.")
  }
  if (enabledSets.length === 0) throw new Error("Selecione ao menos um conjunto de caracteres.")

  const pool = enabledSets.map((name) => PASSWORD_SETS[name]).join("")
  const chars = enabledSets.map((name) => {
    const set = PASSWORD_SETS[name]
    return set[secureRandomInt(set.length, randomFill)]
  })

  while (chars.length < length) chars.push(pool[secureRandomInt(pool.length, randomFill)])
  for (let index = chars.length - 1; index > 0; index--) {
    const target = secureRandomInt(index + 1, randomFill)
    ;[chars[index], chars[target]] = [chars[target], chars[index]]
  }
  return chars.join("")
}

export function generateSecureUUID(randomFill: RandomFill = defaultRandomFill) {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID()
  const bytes = randomFill(new Uint8Array(16))
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}
