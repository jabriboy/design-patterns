import { families, patterns } from "./data/patterns.js";

const shell = document.querySelector("#appShell");
const screen = document.querySelector("#screen");
const nav = document.querySelector("#chapterNav");
const counter = document.querySelector("#slideCounter");
const progress = document.querySelector("#progressBar");
const crumb = document.querySelector("#crumbCurrent");
const stageButton = document.querySelector("#stageButton");
const order = ["inicio", "mapa", ...patterns.map(({ id }) => id)];

const questions = {
  singleton: "Esse estado precisa mesmo ser único dentro deste processo?",
  factory: "Qual detalhe de criação pode sair do caminho do cliente?",
  "abstract-factory": "Quais objetos precisam pertencer à mesma família?",
  builder: "Quais combinações precisam ser validadas antes de existir?",
  adapter: "Que contrato o cliente entende e o legado não oferece?",
  decorator: "Que comportamento pode ser acrescentado sem mudar o contrato?",
  facade: "Qual sequência complexa deveria parecer uma única operação?",
  iterator: "Como consumir os dados sem conhecer seu armazenamento?",
  observer: "Quem precisa reagir quando esse estado mudar?",
  strategy: "Qual algoritmo pode variar sem mudar quem o utiliza?"
};

function currentId() {
  try {
    const requested = decodeURIComponent(window.location.hash.slice(1));
    return order.includes(requested) ? requested : "inicio";
  } catch {
    return "inicio";
  }
}

function setRoute(id) {
  if (!order.includes(id)) return;
  if (currentId() === id) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  window.location.hash = id;
}

function renderNavigation() {
  const rows = [`
    <label class="nav-search">
      <span aria-hidden="true">⌕</span>
      <input id="navSearch" type="search" placeholder="Buscar padrão…" aria-label="Buscar um padrão" autocomplete="off" />
      <kbd>/</kbd>
    </label>
    <a class="overview-link" href="#mapa" data-route="mapa">
      <span class="nav-number">00</span><span class="nav-label">Mapa da apresentação</span><span class="nav-entry-mark">↗</span>
    </a>
  `];
  for (const family of families) {
    const items = patterns.filter((item) => item.family === family);
    rows.push(`<div class="nav-group-label"><span>${family}</span><span>${String(items.length).padStart(2, "0")}</span></div>`);
    for (const item of items) {
      rows.push(`<a class="nav-item" href="#${item.id}" data-route="${item.id}" data-search="${item.name} ${item.family} ${item.tagline}">
        <span class="nav-number">${item.number}</span><span class="nav-label">${item.name}</span><span class="nav-entry-mark">↗</span>
      </a>`);
    }
  }
  nav.innerHTML = rows.join("");
  nav.querySelectorAll("a[data-route]").forEach((link) => {
    if (link.dataset.route === currentId()) link.setAttribute("aria-current", "page");
  });
  const search = nav.querySelector("#navSearch");
  search.addEventListener("input", () => {
    const term = search.value.trim().toLocaleLowerCase("pt-BR");
    nav.querySelectorAll(".nav-item").forEach((item) => {
      item.hidden = term !== "" && !item.dataset.search.toLocaleLowerCase("pt-BR").includes(term);
    });
    nav.querySelectorAll(".nav-group-label").forEach((label) => {
      let next = label.nextElementSibling;
      let visible = false;
      while (next && !next.classList.contains("nav-group-label")) {
        if (next.matches(".nav-item") && !next.hidden) visible = true;
        next = next.nextElementSibling;
      }
      label.hidden = !visible;
    });
  });
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  })[character]);
}

function colorizeLine(line) {
  const token = /(\/\/.*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:interface|type|class|private|public|readonly|static|constructor|implements|extends|async|await|return|new|this|throw|if|else|for|of|in|while|try|catch|yield|switch|case|default|function|const|let|export|as|typeof)\b|\b(?:true|false|null|undefined)\b|\b\d[\d_]*(?:\.\d+)?\b|=>|[{}()[\].,;:<>+=!?|&*/%-])/g;
  let output = "";
  let previous = 0;
  for (const match of line.matchAll(token)) {
    output += escapeHtml(line.slice(previous, match.index));
    const value = match[0];
    let kind = "punctuation";
    if (value.startsWith("//")) kind = "comment";
    else if (value.startsWith("\"") || value.startsWith("'")) kind = "string";
    else if (/^\d/.test(value)) kind = "number";
    else if (/^(true|false|null|undefined)$/.test(value)) kind = "literal";
    else if (/^(interface|type|class|private|public|readonly|static|constructor|implements|extends|async|await|return|new|this|throw|if|else|for|of|in|while|try|catch|yield|switch|case|default|function|const|let|export|as|typeof)$/.test(value)) kind = "keyword";
    output += `<span class="tok-${kind}">${escapeHtml(value)}</span>`;
    previous = match.index + value.length;
  }
  return output + escapeHtml(line.slice(previous));
}

function formatCode(code) {
  return code.split("\n").map((line) => `<span class="code-line"><span class="line-text">${colorizeLine(line) || " "}</span></span>`).join("\n");
}

function renderIntro() {
  screen.innerHTML = `
    <section class="intro-screen screen-enter">
      <div class="intro-copy">
        <div class="eyebrow"><span class="eyebrow-dot"></span> GUIA VISUAL · TYPESCRIPT · 10 PADRÕES</div>
        <h1>Projetar é decidir<br />o que <em>não precisa</em><br />se repetir.</h1>
        <p class="intro-deck">Dez padrões clássicos, explicados pelo problema que resolvem — com exemplos que saem do óbvio e chegam perto de sistemas reais.</p>
        <div class="intro-actions">
          <a class="primary-button" href="#mapa">Explorar a apresentação <span aria-hidden="true">↗</span></a>
          <span class="read-time"><span class="read-time-line"></span> ~12 MIN DE LEITURA</span>
        </div>
        <div class="intro-meta"><span>03 FAMÍLIAS</span><span class="meta-sep">·</span><span>10 CENÁRIOS DE SOFTWARE</span><span class="meta-sep">·</span><span>10 TRECHOS TYPESCRIPT</span></div>
      </div>
      <div class="intro-art" aria-label="Diagrama abstrato conectando padrões de software">
        <div class="art-stamp">DESIGN<br />PATTERNS<br /><span>FIELD NOTES / 01</span></div>
        <svg class="orbit-art" viewBox="0 0 520 520" role="img" aria-label="Rede circular de nós conectados">
          <circle class="orbit orbit-one" cx="260" cy="260" r="202" />
          <circle class="orbit orbit-two" cx="260" cy="260" r="146" />
          <circle class="orbit orbit-three" cx="260" cy="260" r="88" />
          <path class="orbit-path" d="M71 198 167 99 310 89 430 175 407 319 292 420 153 381 71 198ZM167 99 213 213 310 89M71 198l142 15 79 207M430 175l-138 38 115 106M153 381l60-168" />
          <circle class="node node-lime" cx="71" cy="198" r="9" /><circle class="node node-dark" cx="167" cy="99" r="7" />
          <circle class="node node-blue" cx="310" cy="89" r="10" /><circle class="node node-dark" cx="430" cy="175" r="7" />
          <circle class="node node-coral" cx="407" cy="319" r="9" /><circle class="node node-dark" cx="292" cy="420" r="7" />
          <circle class="node node-lime" cx="153" cy="381" r="10" /><circle class="node node-dark" cx="213" cy="213" r="7" />
          <circle class="center-disc" cx="260" cy="260" r="42" /><text class="center-mark" x="260" y="267" text-anchor="middle">{ }</text>
          <text class="orbit-label" x="44" y="165">CRIAÇÃO</text><text class="orbit-label" x="414" y="350">COMPORTAMENTO</text>
        </svg>
        <div class="art-caption"><span>01—10</span><span>FORMAS DE PENSAR SISTEMAS</span></div>
      </div>
      <div class="intro-edge-note"><span class="edge-rule"></span><span>MENOS RECEITAS.<br />MAIS INTENÇÃO.</span></div>
    </section>
    <section class="intro-bottom">
      <div class="intro-bottom-label">NESTE GUIA</div>
      <p>Criação <span>→</span> Estrutura <span>→</span> Comportamento</p>
      <a href="#mapa">Ver o mapa completo <span aria-hidden="true">↓</span></a>
    </section>
  `;
  crumb.textContent = "APRESENTAÇÃO";
  counter.innerHTML = "00 <b>/</b> 10";
  progress.style.width = "0%";
  document.title = "Padrões de Design — Laboratório TypeScript";
}

function renderMap() {
  const familyDetails = {
    "Criação": { roman: "I", title: "Como os objetos passam a existir", note: "Escolha, combine e monte sem amarrar quem usa a quem constrói." },
    "Estrutura": { roman: "II", title: "Como peças diferentes se conectam", note: "Adapte, estenda e simplifique relações entre componentes." },
    "Comportamento": { roman: "III", title: "Como responsabilidades se movem", note: "Percorra, notifique e varie algoritmos com menos acoplamento." }
  };
  screen.innerHTML = `
    <section class="map-screen screen-enter">
      <div class="section-kicker"><span>00</span><span class="kicker-rule"></span><span>O MAPA</span></div>
      <div class="map-heading-row"><div><h1>Dez padrões.<br /><em>Três perguntas.</em></h1><p class="section-intro">Não memorize nomes isolados. Comece pela fricção que você quer remover.</p></div><div class="map-index">SELECIONE UM<br />CAPÍTULO <span>↘</span></div></div>
      <div class="family-grid">
        ${families.map((family) => {
          const info = familyDetails[family];
          const items = patterns.filter((pattern) => pattern.family === family);
          return `<section class="family-section family-${family.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "")}">
            <div class="family-heading"><span class="family-roman">${info.roman}</span><div><span class="family-label">PADRÕES DE ${family.toLocaleUpperCase("pt-BR")}</span><h2>${info.title}</h2><p>${info.note}</p></div><span class="family-count">${String(items.length).padStart(2, "0")}</span></div>
            <div class="pattern-card-list">${items.map((item) => `<a class="map-card accent-${item.accent}" href="#${item.id}">
              <span class="map-card-top"><span>${item.number} / ${item.family.toUpperCase()}</span><span class="card-arrow">↗</span></span>
              <strong>${item.name}</strong><span class="map-card-tagline">${item.tagline}</span>
            </a>`).join("")}</div>
          </section>`;
        }).join("")}
      </div>
      <div class="map-bottom-note"><span class="status-dot"></span> Cada capítulo conecta intenção, cenário, decisão e trade-off.</div>
    </section>
  `;
  crumb.textContent = "MAPA DA APRESENTAÇÃO";
  counter.innerHTML = "00 <b>/</b> 10";
  progress.style.width = "0%";
  document.title = "Mapa — Padrões de Design";
}

function renderPattern(pattern) {
  const position = patterns.indexOf(pattern) + 1;
  screen.innerHTML = `
    <article class="pattern-screen screen-enter accent-${pattern.accent}">
      <div class="pattern-heading">
        <div class="section-kicker"><span>${pattern.number}</span><span class="kicker-rule"></span><span>${pattern.family.toUpperCase()} · PADRÃO ${String(position).padStart(2, "0")} DE 10</span></div>
        <div class="pattern-title-row"><h1>${pattern.name}</h1><span class="pattern-index">${pattern.number}<span>/10</span></span></div>
        <p class="pattern-tagline">${pattern.tagline}</p>
      </div>
      <div class="pattern-layout">
        <div class="concept-column">
          <div class="scenario-card"><span class="scenario-mark">↳</span><div><span class="micro-label">CENÁRIO DO EXEMPLO</span><strong>${pattern.scenario}</strong></div></div>
          <section class="concept-block"><span class="micro-label"><span class="block-index">01</span> INTENÇÃO</span><p>${pattern.intent}</p></section>
          <section class="concept-block"><span class="micro-label"><span class="block-index">02</span> QUANDO USAR</span><p>${pattern.use}</p></section>
          <section class="concept-block tradeoff-block"><span class="micro-label"><span class="block-index">03</span> TRADE-OFF</span><p>${pattern.tradeoff}</p></section>
          <aside class="question-card"><span class="question-mark">?</span><div><span class="micro-label">PERGUNTA DE DESIGN</span><p>${questions[pattern.id]}</p></div></aside>
        </div>
        <div class="code-column">
          <div class="code-panel">
            <div class="code-toolbar"><div class="code-file"><span class="code-file-dot"></span><span>exemplo.ts</span><span class="code-file-divider">/</span><span>${pattern.id}</span></div><button type="button" class="copy-button" data-copy="true" aria-label="Copiar exemplo TypeScript"><span class="copy-symbol" aria-hidden="true">▢</span><span>Copiar</span></button></div>
            <div class="code-description"><span>TYPESCRIPT</span><span>EXEMPLO APLICADO</span></div>
            <pre class="code-pre" aria-label="Exemplo de código TypeScript"><code>${formatCode(pattern.code)}</code></pre>
            <div class="code-panel-footer"><span><i></i> A INTERFACE É O ACORDO</span><span>${pattern.number} / 10</span></div>
          </div>
          <div class="code-note"><span class="note-symbol">↗</span><p><strong>Repare:</strong> o padrão resolve uma decisão arquitetural; ele não substitui regras de domínio, tratamento de falhas ou limites de infraestrutura.</p></div>
        </div>
      </div>
      <div class="pattern-tail"><span>IDEIA-CHAVE</span><span>${pattern.tagline}</span><a href="#mapa">VOLTAR AO MAPA <span aria-hidden="true">↗</span></a></div>
    </article>
  `;
  crumb.textContent = pattern.name.toUpperCase();
  counter.innerHTML = `${String(position).padStart(2, "0")} <b>/</b> 10`;
  progress.style.width = `${position * 10}%`;
  document.title = `${pattern.name} — Padrões de Design`;
}

function render() {
  const id = currentId();
  renderNavigation();
  if (id === "inicio") renderIntro();
  else if (id === "mapa") renderMap();
  else renderPattern(patterns.find((pattern) => pattern.id === id));
  document.querySelector("#prevButton").title = `Anterior (${navigator.platform.includes("Mac") ? "←" : "←"})`;
}

function move(delta) {
  const index = order.indexOf(currentId());
  const nextIndex = (index + delta + order.length) % order.length;
  setRoute(order[nextIndex]);
}

document.querySelector("#prevButton").addEventListener("click", () => move(-1));
document.querySelector("#nextButton").addEventListener("click", () => move(1));
stageButton.addEventListener("click", () => {
  const enabled = document.body.classList.toggle("stage-mode");
  stageButton.setAttribute("aria-pressed", String(enabled));
  stageButton.querySelector("span:last-child").textContent = enabled ? "Sair do palco" : "Modo palco";
});

screen.addEventListener("click", async (event) => {
  const copyButton = event.target.closest("[data-copy]");
  if (!copyButton) return;
  const code = screen.querySelector(".code-pre code");
  const text = code?.textContent ?? "";
  try {
    await navigator.clipboard.writeText(text);
    copyButton.classList.add("copied");
    copyButton.querySelector("span:last-child").textContent = "Copiado";
    window.setTimeout(() => {
      copyButton.classList.remove("copied");
      if (copyButton.isConnected) copyButton.querySelector("span:last-child").textContent = "Copiar";
    }, 1600);
  } catch {
    copyButton.querySelector("span:last-child").textContent = "Selecione o código";
    window.setTimeout(() => {
      if (copyButton.isConnected) copyButton.querySelector("span:last-child").textContent = "Copiar";
    }, 1800);
  }
});

window.addEventListener("hashchange", () => {
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
});
window.addEventListener("keydown", (event) => {
  const target = event.target;
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target.isContentEditable) {
    if (event.key === "Escape") target.blur();
    return;
  }
  if (event.key === "ArrowRight" || event.key === "PageDown") {
    event.preventDefault();
    move(1);
  } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
    event.preventDefault();
    move(-1);
  } else if (event.key.toLowerCase() === "f") {
    event.preventDefault();
    stageButton.click();
  } else if (event.key === "/") {
    event.preventDefault();
    nav.querySelector("#navSearch")?.focus();
  }
});

render();
