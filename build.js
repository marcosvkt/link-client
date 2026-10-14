// Gera um site por cliente a partir de clientes/*.json
// Uso local:  node build.js   (saída em dist/)
// No Netlify roda sozinho a cada alteração no GitHub.
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const OUT = path.join(ROOT, "dist");
const SITE_URL = (process.env.URL || "").replace(/\/$/, ""); // o Netlify preenche essa variável

const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const jsonSafe = o => JSON.stringify(o).replace(/</g, "\\u003c");

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const template = fs.readFileSync(path.join(ROOT, "template.html"), "utf8");
const files = fs.readdirSync(path.join(ROOT, "clientes")).filter(f => f.endsWith(".json"));

const errors = [];
const redirects = [];
const seen = new Set();
const built = [];

for (const file of files) {
  let c;
  try { c = JSON.parse(fs.readFileSync(path.join(ROOT, "clientes", file), "utf8")); }
  catch (e) { errors.push(`${file}: JSON inválido (${e.message})`); continue; }

  const slug = (c.slug || path.basename(file, ".json")).toLowerCase();
  if (!/^[a-z0-9-]+$/.test(slug)) { errors.push(`${file}: slug "${slug}" só pode ter letras minúsculas, números e hífen`); continue; }
  if (seen.has(slug)) { errors.push(`${file}: slug "${slug}" repetido`); continue; }
  for (const k of ["nome", "corPrincipal", "corFundo", "whatsapp"]) if (!c[k]) errors.push(`${file}: campo "${k}" vazio`);
  seen.add(slug); c.slug = slug;

  const dominio = (c.dominio || "").replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
  const base = dominio ? `https://${dominio}` : (SITE_URL ? `${SITE_URL}/${slug}` : "");
  const abs = u => !u ? "" : /^https?:/.test(u) ? u : (dominio ? `https://${dominio}${u}` : SITE_URL + u);

  const head = [
    `<title>${esc(c.nome)} – ${esc(c.slogan)}</title>`,
    `<meta name="description" content="${esc(c.slogan)}">`,
    `<meta name="theme-color" content="${esc(c.corFundo)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:title" content="${esc(c.nome)}">`,
    `<meta property="og:description" content="${esc(c.slogan)}">`,
    c.fotoCapa ? `<meta property="og:image" content="${esc(abs(c.fotoCapa))}">` : "",
    base ? `<meta property="og:url" content="${esc(base)}">` : "",
    c.logo ? `<link rel="icon" href="${esc(c.logo)}">` : ""
  ].filter(Boolean).join("\n");

  const html = template.replace("__CONFIG_JSON__", jsonSafe(c)).replace("<!--HEAD-->", head);
  fs.mkdirSync(path.join(OUT, slug), { recursive: true });
  fs.writeFileSync(path.join(OUT, slug, "index.html"), html);

  // Links curtos: /slug/whatsapp  (e dominio.com.br/whatsapp quando houver domínio)
  const u0 = (c.unidades || [])[0] || {};
  const wa = `https://wa.me/${c.whatsapp}?text=${encodeURIComponent(c.mensagemWhatsapp || "Olá!")}`;
  const curtos = {
    whatsapp: wa,
    pedido: (c.delivery || [])[0]?.link || wa,
    cardapio: c.cardapio,
    local: u0.endereco ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(u0.endereco)}` : "",
    instagram: c.instagram,
    avaliar: c.avaliarGoogle,
    reserva: c.reserva || `https://wa.me/${c.whatsapp}?text=${encodeURIComponent("Olá! Gostaria de reservar uma mesa.")}`
  };
  for (const [k, url] of Object.entries(curtos)) if (url) redirects.push(`/${slug}/${k}  ${url}  302`);

  if (dominio) {
    const bloco = [];
    for (const d of [dominio, `www.${dominio}`]) {
      bloco.push(`https://${d}/imagens/*  /imagens/:splat  200!`);
      for (const [k, url] of Object.entries(curtos)) if (url) bloco.push(`https://${d}/${k}  ${url}  302!`);
      bloco.push(`https://${d}/*  /${slug}/:splat  200!`);
    }
    redirects.unshift(...bloco);
  }
  built.push({ slug, nome: c.nome, dominio });
}

// Imagens dos clientes
if (fs.existsSync(path.join(ROOT, "imagens"))) fs.cpSync(path.join(ROOT, "imagens"), path.join(OUT, "imagens"), { recursive: true });

// Gerador com o template embutido
const gerador = fs.readFileSync(path.join(ROOT, "gerador.html"), "utf8")
  .replace("/*TPL*/null/*TPL*/", jsonSafe(template));
fs.mkdirSync(path.join(OUT, "gerador"), { recursive: true });
fs.writeFileSync(path.join(OUT, "gerador", "index.html"), gerador);

// Página raiz (não lista os clientes)
fs.writeFileSync(path.join(OUT, "index.html"),
  `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sites de restaurantes</title>
<body style="font-family:system-ui;display:grid;place-items:center;min-height:90vh;color:#333"><p>Sites de restaurantes</p></body>`);

// Páginas de domínio próprio vêm primeiro (regras com "!" forçam o redirecionamento)
fs.writeFileSync(path.join(OUT, "_redirects"), redirects.join("\n") + "\n");

console.log(`✔ ${built.length} site(s) gerado(s):`);
for (const b of built) console.log(`   /${b.slug}/${b.dominio ? "  →  " + b.dominio : ""}  (${b.nome})`);
if (errors.length) {
  console.error("\n✖ Erros:\n - " + errors.join("\n - "));
  process.exit(1);
}
