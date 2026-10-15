import { describe, expect, it } from "vitest"
import { marked } from "marked"
import { binaryToText, textToBinary } from "./binary"
import { parseCurl, curlToFetch } from "./curl-parser"
import { convertStructuredData, parseStructuredData } from "./data-converter"
import { computeLineDiff, validateDiffInput } from "./diff-tools"
import { safeImageUrl, safeMarkdownUrl } from "./markdown-safe"
import { isPotentiallyCatastrophic, validateRegexInput } from "./regex-safety"
import { generateSecurePassword } from "./secure-random"
import { calculateCompletionDate, calculateWorkedTime } from "./time-tools"

describe("Markdown seguro", () => {
  it("bloqueia esquemas executáveis e aceita links web", () => {
    expect(safeMarkdownUrl("javascript:alert(1)")).toBeNull()
    expect(safeMarkdownUrl("java\nscript:alert(1)")).toBeNull()
    expect(safeImageUrl("data:image/svg+xml,<svg onload=alert(1)>")).toBeNull()
    expect(safeMarkdownUrl("https://www.noclipcode.com/")).toBe("https://www.noclipcode.com/")
  })
  it.each(["<img src=x onerror=alert(1)>", "<script>alert(1)</script>"])("mantém HTML bruto como token textual: %s", (markdown) => {
    const token = marked.lexer(markdown)[0]
    expect(token.type).toBe("html")
    expect(token.raw).toBe(markdown)
  })
  it("bloqueia o exemplo obrigatório de link javascript", () => {
    const token = marked.lexer("[javascript](javascript:alert(1))")[0]
    expect(token.type).toBe("paragraph")
    if (token.type !== "paragraph") throw new Error("Token inesperado")
    const link = token.tokens?.find((item) => item.type === "link")
    expect(link?.type === "link" ? safeMarkdownUrl(link.href) : "token ausente").toBeNull()
  })
})

describe("aleatoriedade segura", () => {
  it("inclui pelo menos um caractere de cada conjunto selecionado", () => {
    let value = 0
    const password = generateSecurePassword(32, ["uppercase", "lowercase", "numbers", "symbols"], (bytes) => { bytes[0] = value++ % 200; return bytes })
    expect(password).toMatch(/[A-Z]/)
    expect(password).toMatch(/[a-z]/)
    expect(password).toMatch(/[0-9]/)
    expect(password).toMatch(/[^A-Za-z0-9]/)
  })
  it("respeita o comprimento e recusa configuração vazia", () => {
    expect(generateSecurePassword(64, ["numbers"])).toHaveLength(64)
    expect(() => generateSecurePassword(16, [])).toThrow(/ao menos um conjunto/)
  })
})

describe("binário UTF-8", () => {
  it.each(["Olá, mundo!", "日本語", "🚀 café"])('faz round-trip de "%s"', (value) => expect(binaryToText(textToBinary(value))).toBe(value))
  it("recusa bytes incompletos e UTF-8 inválido", () => {
    expect(() => binaryToText("101")).toThrow(/8 bits/)
    expect(() => binaryToText("11111111")).toThrow(/UTF-8/)
  })
})

describe("tempo", () => {
  it("conta a data inicial como primeiro dia útil e preserva frações", () => {
    const result = calculateCompletionDate("2026-10-16", 9.5, 8)
    expect(result.date.getDay()).toBe(1)
    expect(result.hoursIntoDay).toBe(1.5)
  })
  it("normaliza início no fim de semana", () => expect(calculateCompletionDate("2026-10-17", 2, 8).date.getDay()).toBe(1))
  it("calcula turno noturno e valida intervalo", () => {
    expect(calculateWorkedTime("22:00", "06:00", 60)).toMatchObject({ netMinutes: 420, overnight: true })
    expect(() => calculateWorkedTime("09:00", "10:00", 60)).toThrow(/intervalo/)
  })
})

describe("limites contra travamento", () => {
  it("identifica regex de quantificadores aninhados e limita texto", () => {
    expect(isPotentiallyCatastrophic("(a+)+$")).toBe(true)
    expect(validateRegexInput("a", "x".repeat(100_001))).toMatch(/limitado/)
  })
  it("recusa diff excessivo e calcula um diff normal", () => {
    expect(validateDiffInput("a\n".repeat(1500), "b\n".repeat(1500))).toMatch(/linhas demais/)
    expect(computeLineDiff("a\nb", "a\nc").map((part) => part.type)).toEqual(["same", "add", "remove"])
  })
})

describe("conversor de dados", () => {
  it("preserva JSON complexo e recusa JSON inválido", async () => {
    const input = '{"items":[{"ok":true,"value":null}],"count":1}'
    expect(await parseStructuredData(input, "json")).toEqual({ items: [{ ok: true, value: null }], count: 1 })
    await expect(parseStructuredData("{", "json")).rejects.toThrow()
  })
  it("preserva YAML aninhado e arrays", async () => {
    const result = JSON.parse(await convertStructuredData("user:\n  name: Ana\n  roles: [admin, editor]", "yaml", "json"))
    expect(result.user.roles).toEqual(["admin", "editor"])
  })
  it("preserva atributos e elementos repetidos do XML", async () => {
    const result = await parseStructuredData('<root id="7"><item>A</item><item>B</item></root>', "xml") as { root: { "@_id": string; item: string[] } }
    expect(result.root["@_id"]).toBe("7")
    expect(result.root.item).toEqual(["A", "B"])
  })
  it("recusa documentos inválidos", async () => await expect(parseStructuredData("<root>", "xml")).rejects.toThrow(/XML inválido/))
})

describe("cURL", () => {
  it("interpreta GET com query string", () => expect(parseCurl("curl 'https://api.test/items?q=um%20dois'")).toMatchObject({ method: "GET", url: "https://api.test/items?q=um%20dois" }))
  it("interpreta múltiplos dados, auth, cookies e quebras de linha", () => {
    const result = parseCurl("curl https://api.test/items \\\n-u 'ana:senha' -b 'sid=123' -H 'X-Test: sim' -d 'a=1' --data 'b=2'")
    expect(result).toMatchObject({ method: "POST", url: "https://api.test/items", body: "a=1&b=2" })
    expect(result.headers).toMatchObject({ Cookie: "sid=123", "X-Test": "sim" })
    expect(result.headers.Authorization).toMatch(/^Basic /)
  })
  it("gera FormData sem transformar arquivo em string", () => {
    const result = parseCurl("curl https://api.test/upload -F 'name=Ana' -F 'file=@foto.png'")
    expect(result.form).toHaveLength(2)
    expect(curlToFetch(result)).toContain("FormData")
  })
})
