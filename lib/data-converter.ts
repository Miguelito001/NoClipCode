export type DataFormat = "json" | "yaml" | "xml"

export async function parseStructuredData(input: string, format: DataFormat): Promise<unknown> {
  if (!input.trim()) throw new Error("Insira algum conteúdo para converter.")
  if (format === "json") return JSON.parse(input)
  if (format === "yaml") {
    const { parse } = await import("yaml")
    return parse(input)
  }
  const { XMLParser, XMLValidator } = await import("fast-xml-parser")
  const validation = XMLValidator.validate(input)
  if (validation !== true) throw new Error(`XML inválido: ${validation.err.msg}`)
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", textNodeName: "#text", parseTagValue: true })
  return parser.parse(input)
}

export async function stringifyStructuredData(data: unknown, format: DataFormat) {
  if (format === "json") return JSON.stringify(data, null, 2)
  if (format === "yaml") {
    const { stringify } = await import("yaml")
    return stringify(data)
  }
  const { XMLBuilder } = await import("fast-xml-parser")
  const builder = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: "@_", textNodeName: "#text", format: true })
  const record = data && typeof data === "object" && !Array.isArray(data) ? data as Record<string, unknown> : { root: data }
  return builder.build(record)
}

export async function convertStructuredData(input: string, from: DataFormat, to: DataFormat) {
  return stringifyStructuredData(await parseStructuredData(input, from), to)
}
