# Padrões de Design — Laboratório TypeScript

Apresentação web interativa, em português, sobre dez padrões de design. Cada capítulo explica intenção, quando usar e trade-offs, com um cenário e um snippet TypeScript.

## Executar localmente

Requer Node.js 18 ou superior. O projeto não usa dependências externas.

```bash
npm run dev
```

Abra `http://localhost:3000` no navegador. Para verificar os arquivos JavaScript e gerar a saída estática:

```bash
npm run check
npm run build
```

O build fica em `dist/` e pode ser reconstruído a qualquer momento.

## Navegação

Use os links de capítulos, a busca na barra lateral, as setas esquerda/direita ou Page Up/Page Down. O modo palco pode ser alternado pelo botão ou pela tecla `F`. Nos capítulos, use **Copiar** para copiar o snippet TypeScript.

## Estrutura

- `index.html` — documento principal e metadados.
- `src/app.js` — apresentação, busca, navegação e destaque/cópia do código.
- `src/data/patterns.js` — conteúdo dos dez padrões e exemplos TypeScript.
- `src/styles.css` — identidade visual e layout responsivo.
- `server.mjs` — servidor estático de desenvolvimento, sem dependências.
- `build.mjs` — gera a pasta estática `dist/`.
- `logo.svg` — ícone vetorial do site.
