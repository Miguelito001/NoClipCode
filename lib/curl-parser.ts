export type CurlRequest = {
  method: string
  url: string
  headers: Record<string, string>
  body: string
  form: Array<{ name: string; value: string; file: boolean }>
}

export function tokenizeCurl(command: string) {
  const tokens: string[] = []
  let token = "", quote = "", escaping = false
  for (const char of command.replace(/\\\r?\n/g, " ").trim()) {
    if (escaping) { token += char; escaping = false; continue }
    if (char === "\\" && quote !== "'") { escaping = true; continue }
    if (quote) { if (char === quote) quote = ""; else token += char; continue }
    if (char === "'" || char === '"') { quote = char; continue }
    if (/\s/.test(char)) { if (token) { tokens.push(token); token = "" } }
    else token += char
  }
  if (quote) throw new Error("Há aspas sem fechamento no comando.")
  if (escaping) token += "\\"
  if (token) tokens.push(token)
  return tokens
}

function basicAuth(value: string) {
  const bytes = new TextEncoder().encode(value)
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

export function parseCurl(command: string): CurlRequest {
  const tokens = tokenizeCurl(command)
  if (tokens[0]?.toLowerCase() !== "curl") throw new Error("O comando precisa começar com curl.")
  const request: CurlRequest = { method: "", url: "", headers: {}, body: "", form: [] }
  const data: string[] = []
  for (let i = 1; i < tokens.length; i++) {
    const token = tokens[i]
    const next = () => {
      const value = tokens[++i]
      if (value === undefined) throw new Error(`Falta um valor depois de ${token}.`)
      return value
    }
    if (token === "-X" || token === "--request") request.method = next().toUpperCase()
    else if (token === "-H" || token === "--header") {
      const header = next(); const separator = header.indexOf(":")
      if (separator <= 0) throw new Error(`Header inválido: ${header}`)
      request.headers[header.slice(0, separator).trim()] = header.slice(separator + 1).trim()
    } else if (["-d", "--data", "--data-raw", "--data-binary"].includes(token)) data.push(next())
    else if (token === "--data-urlencode") {
      const value = next(); const separator = value.indexOf("=")
      data.push(separator < 0 ? encodeURIComponent(value) : `${encodeURIComponent(value.slice(0, separator))}=${encodeURIComponent(value.slice(separator + 1))}`)
    } else if (token === "-u" || token === "--user") request.headers.Authorization = `Basic ${basicAuth(next())}`
    else if (token === "-b" || token === "--cookie") request.headers.Cookie = next()
    else if (token === "-F" || token === "--form") {
      const value = next(); const separator = value.indexOf("=")
      if (separator <= 0) throw new Error(`Campo de formulário inválido: ${value}`)
      const fieldValue = value.slice(separator + 1)
      request.form.push({ name: value.slice(0, separator), value: fieldValue.replace(/^@/, ""), file: fieldValue.startsWith("@") })
    } else if (!token.startsWith("-") && !request.url) request.url = token
  }
  if (!request.url) throw new Error("URL não encontrada no comando.")
  request.body = data.join("&")
  request.method ||= request.body || request.form.length ? "POST" : "GET"
  return request
}

const quoted = (value: string) => JSON.stringify(value)

export function curlToFetch(request: CurlRequest) {
  const lines = [`const headers = ${JSON.stringify(request.headers, null, 2)};`]
  if (request.form.length) {
    lines.push("const form = new FormData();")
    for (const item of request.form) lines.push(item.file
      ? `form.append(${quoted(item.name)}, /* selecione o arquivo: ${item.value} */ file);`
      : `form.append(${quoted(item.name)}, ${quoted(item.value)});`)
  }
  const options = [`method: ${quoted(request.method)}`, "headers"]
  if (request.form.length) options.push("body: form")
  else if (request.body) options.push(`body: ${quoted(request.body)}`)
  lines.push(`const response = await fetch(${quoted(request.url)}, {\n  ${options.join(",\n  ")}\n});`)
  lines.push("const data = await response.json();")
  return lines.join("\n")
}

export function curlToAxios(request: CurlRequest) {
  if (request.form.length) return `const form = new FormData();\n${request.form.map((item) => item.file ? `form.append(${quoted(item.name)}, file);` : `form.append(${quoted(item.name)}, ${quoted(item.value)});`).join("\n")}\n\nconst response = await axios({\n  method: ${quoted(request.method.toLowerCase())},\n  url: ${quoted(request.url)},\n  headers: { ...${JSON.stringify(request.headers)}, ...form.getHeaders?.() },\n  data: form,\n});`
  return `const response = await axios({\n  method: ${quoted(request.method.toLowerCase())},\n  url: ${quoted(request.url)},\n  headers: ${JSON.stringify(request.headers, null, 2)},${request.body ? `\n  data: ${quoted(request.body)},` : ""}\n});`
}

export function curlToPython(request: CurlRequest) {
  const files = request.form.filter((item) => item.file)
  const fields = request.form.filter((item) => !item.file)
  return `import requests\n\nresponse = requests.request(\n    ${quoted(request.method)},\n    ${quoted(request.url)},\n    headers=${JSON.stringify(request.headers)},${request.body ? `\n    data=${quoted(request.body)},` : ""}${fields.length ? `\n    data=${JSON.stringify(Object.fromEntries(fields.map((item) => [item.name, item.value])))},` : ""}${files.length ? `\n    files=${JSON.stringify(Object.fromEntries(files.map((item) => [item.name, [item.value, "<arquivo>"]])))},` : ""}\n)\nprint(response.json())`
}
