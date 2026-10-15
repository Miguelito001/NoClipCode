export function safeMarkdownUrl(value: string) {
  const compact = value.trim().replace(/[\u0000-\u001f\u007f\s]+/g, "")
  if (!compact) return null
  if (/^(?:https?:|mailto:|tel:|\/|#)/i.test(compact)) return value
  return null
}

export function safeImageUrl(value: string) {
  const compact = value.trim().replace(/[\u0000-\u001f\u007f\s]+/g, "")
  if (/^(?:https?:|\/)/i.test(compact)) return value
  return null
}
