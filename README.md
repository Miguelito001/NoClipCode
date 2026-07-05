# NoClipCode

> Você atravessou a parede.

**NoClipCode** é uma caixa de ferramentas online para desenvolvedores — um hub com dezenas de utilitários para converter, formatar, testar e gerar dados diretamente no navegador. Rápido, seguro e sem instalação: seus dados nunca saem do seu dispositivo.

Anteriormente conhecido como **EncodeHub**, o projeto passou por um rebranding completo para **NoClipCode**, ganhando uma nova identidade visual com temática _noclip_ (terminal/retro) e uma coleção muito maior de ferramentas.

## Funcionalidades

O NoClipCode reúne **29 ferramentas** organizadas por categoria.

### Conversão

- **Base64** — Codifique e decodifique texto em Base64 de forma rápida e segura.
- **Binário** — Converta texto para binário e binário para texto.
- **Bases Numéricas** — Converta entre decimal, hexadecimal, octal e binário ao mesmo tempo.
- **JSON / XML / YAML** — Converta dados entre JSON, XML e YAML instantaneamente.
- **JSON ⇄ CSV** — Converta entre arrays de objetos JSON e planilhas CSV nos dois sentidos.
- **URL Encode / Decode** — Codifique e decodifique strings para uso seguro em URLs.
- **Unidades de Medida** — Converta entre diferentes unidades de medida e moedas.
- **Unix Timestamp** — Converta timestamps Unix (segundos ou ms) em datas legíveis e vice-versa.

### Texto

- **Conversor de Case** — Converta entre camelCase, snake_case, kebab-case e mais.
- **Analisador de Texto** — Conte caracteres, palavras, linhas, bytes e revele caracteres invisíveis.
- **Diff de Texto** — Compare dois textos e veja as diferenças linha a linha.
- **Extrator de Dados** — Extraia e-mails, URLs, IPs, CPFs, telefones e datas de um texto.
- **Markdown Editor** — Escreva Markdown com pré-visualização renderizada ao vivo.

### Dev

- **Formatador de Código** — Formate ou minifique JSON, CSS e HTML com um clique.
- **Formatador de SQL** — Embeleze queries SQL com indentação e palavras-chave padronizadas.
- **Regex Tester** — Teste expressões regulares com destaque de correspondências em tempo real.
- **cURL para Código** — Converta comandos cURL em fetch, Axios ou Python Requests.
- **Tradutor de Cron** — Entenda e gere expressões Cron explicadas em português.
- **Gerador** — Gere UUIDs, senhas seguras e cores aleatórias instantaneamente.
- **Gerador de Mock Data** — Defina campos e gere dados falsos em JSON ou CSV para testes.

### Frontend

- **Entidades HTML** — Converta caracteres especiais em entidades HTML e vice-versa.
- **PX ⇄ REM / EM** — Converta px para rem/em com base no font-size definido.
- **Conversor de Cor** — Converta entre HEX, RGB, HSL e CMYK com pré-visualização.

### Rede

- **Calculadora chmod** — Calcule permissões de arquivos Linux em octal e simbólico.
- **Calculadora CIDR** — Calcule range de IPs, máscara e hosts a partir de notação CIDR.
- **HTTP Status Codes** — Referência rápida e pesquisável de códigos de status HTTP.
- **Parser de URL** — Quebre uma URL em protocolo, host, path e parâmetros de query.

### Criptografia

- **Hash Generator** — Gere hashes criptográficos SHA-1, SHA-256, SHA-512 e MD5.
- **JWT Decoder** — Decodifique tokens JWT e veja header, payload e validade.

### Utilitário

- **Calculadora de Tempo** — Calcule horas de trabalho, datas e carga horária.

## Command Palette

Pressione `Ctrl/Cmd + K` em qualquer página para abrir a paleta de comandos e navegar rapidamente entre todas as ferramentas.

## Stack

- **[Next.js 15](https://nextjs.org/)** (App Router) com **React 19**
- **[TypeScript](https://www.typescriptlang.org/)**
- **[Tailwind CSS](https://tailwindcss.com/)**
- **[lucide-react](https://lucide.dev/)** para ícones
- Bibliotecas de apoio: `sql-formatter`, `cronstrue`, `class-variance-authority`, `tailwind-merge`

## Como Executar Localmente

```bash
# Instale as dependências
npm install

# Rode o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

Scripts disponíveis:

- `npm run dev` — inicia o servidor de desenvolvimento (com Turbopack).
- `npm run build` — gera a build de produção.
- `npm run start` — inicia o servidor de produção.
- `npm run lint` — executa o linter.

## Estrutura do Repositório

```
app/            # Rotas do App Router — uma pasta por ferramenta (base64, jwt, cidr, ...)
  layout.tsx    # Layout raiz, fontes e metadados
  page.tsx      # Página inicial com a grade de ferramentas
  globals.css   # Estilos globais e tema
components/      # Componentes compartilhados (header, command-palette, share-button, ui/)
hooks/          # Hooks React reutilizáveis (use-url-state)
lib/            # Utilitários e registro de ferramentas (tools.ts, utils.ts)
```

O registro central das ferramentas fica em [`lib/tools.ts`](lib/tools.ts) — adicionar uma entrada lá já a inclui automaticamente na home, na paleta de comandos e na navegação.

## Como Contribuir

1. Faça um fork do repositório.
2. Crie um branch para suas alterações: `git checkout -b minha-nova-funcionalidade`.
3. Envie suas alterações: `git commit -m 'Adicionei uma nova funcionalidade'`.
4. Submeta o pull request e aguarde revisão.

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

---

NoClipCode: **Atravesse as paredes da realidade e manipule seus dados no vazio entre os builds.**
