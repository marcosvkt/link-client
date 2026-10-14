// Converte as fotos de entrada/<slug>/ e salva em imagens/<slug>/
// Uso:  node fotos.js          converte o que for novo ou alterado
//       node fotos.js --watch  fica observando a pasta entrada/ e converte ao soltar a foto
// Usa o sips (vem no macOS). Aceita JPG, PNG, HEIC, WEBP, TIFF, GIF.
// Nomes: "logo..." vira logo.png, "capa..." vira capa.jpg, o resto vira nome-sem-acento.jpg
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = __dirname;
const ENTRADA = path.join(ROOT, "entrada");
const SAIDA = path.join(ROOT, "imagens");
const EXT = /\.(jpe?g|png|heic|heif|webp|tiff?|gif|bmp)$/i;
const MAX_KB = 400;

const limpa = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
  .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "foto";

function destino(slug, arquivo) {
  const base = limpa(path.parse(arquivo).name);
  if (base.startsWith("logo")) return { nome: "logo.png", formato: "png", max: 600 };
  if (base.startsWith("capa")) return { nome: "capa.jpg", formato: "jpeg", max: 1600 };
  return { nome: base + ".jpg", formato: "jpeg", max: 1200 };
}

function sips(args) { return execFileSync("sips", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); }

function converte(slug, arquivo) {
  const origem = path.join(ENTRADA, slug, arquivo);
  const d = destino(slug, arquivo);
  const pasta = path.join(SAIDA, slug);
  const saida = path.join(pasta, d.nome);
  if (fs.existsSync(saida) && fs.statSync(saida).mtimeMs >= fs.statSync(origem).mtimeMs) return null;
  fs.mkdirSync(pasta, { recursive: true });

  const info = sips(["-g", "pixelWidth", "-g", "pixelHeight", origem]);
  const w = +(/pixelWidth: (\d+)/.exec(info) || [])[1], h = +(/pixelHeight: (\d+)/.exec(info) || [])[1];
  const reduz = Math.max(w, h) > d.max ? ["-Z", String(d.max)] : [];

  if (d.formato === "png") {
    sips(["-s", "format", "png", ...reduz, origem, "--out", saida]);
  } else {
    // baixa a qualidade até ficar abaixo de MAX_KB
    for (const q of [82, 72, 62, 52]) {
      sips(["-s", "format", "jpeg", "-s", "formatOptions", String(q), ...reduz, origem, "--out", saida]);
      if (fs.statSync(saida).size <= MAX_KB * 1024) break;
    }
  }
  const kb = Math.round(fs.statSync(saida).size / 1024);
  return `${slug}/${arquivo}  →  /imagens/${slug}/${d.nome}  (${kb} KB)`;
}

function rodar() {
  if (!fs.existsSync(ENTRADA)) fs.mkdirSync(ENTRADA);
  const feitos = [], erros = [];
  for (const slug of fs.readdirSync(ENTRADA)) {
    if (!fs.statSync(path.join(ENTRADA, slug)).isDirectory()) continue;
    if (!/^[a-z0-9-]+$/.test(slug)) { erros.push(`entrada/${slug}: o nome da pasta precisa ser o slug (minúsculas, números e hífen)`); continue; }
    for (const arquivo of fs.readdirSync(path.join(ENTRADA, slug))) {
      if (!EXT.test(arquivo)) continue;
      try { const r = converte(slug, arquivo); if (r) feitos.push(r); }
      catch (e) { erros.push(`entrada/${slug}/${arquivo}: ${(e.stderr || e.message).trim()}`); }
    }
  }
  for (const f of feitos) console.log("✔ " + f);
  for (const e of erros) console.error("✖ " + e);
  return erros.length;
}

if (process.argv.includes("--watch")) {
  rodar();
  console.log("Observando entrada/ (Ctrl+C para parar)...");
  let t;
  fs.watch(ENTRADA, { recursive: true }, () => { clearTimeout(t); t = setTimeout(rodar, 800); });
} else {
  process.exit(rodar() ? 1 : 0);
}
