# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Sites de restaurantes (iComanda)

Repositório que gera um site por restaurante. Cada cliente é um JSON em `clientes/`; o `build.js` monta `dist/<slug>/index.html` a partir de `template.html`. O Netlify roda o build a cada push na `main`.

## Estrutura
- `clientes/<slug>.json`: dados de um cliente (veja `clientes/exemplo.json` como referência completa de campos)
- `imagens/<slug>/`: logo e fotos do cliente, referenciadas no JSON como `/imagens/<slug>/arquivo.jpg`
- `template.html`: layout único de todos os sites. Placeholders `__CONFIG_JSON__` e `<!--HEAD-->` NÃO podem ser removidos
- `gerador.html`: ferramenta visual (o build embute o template nela)
- `dist/`: saída do build; nunca commitar

## Comandos
- `node build.js`: gera tudo em `dist/` (Node 20, sem dependências, sem `npm install`). Não há testes nem lint: o build é a validação
- Conferir o resultado: abrir `dist/<slug>/index.html` ou `dist/gerador/index.html`. O `gerador.html` da raiz aberto direto NÃO funciona (o template só é embutido no build)

## Como funciona (visão geral)
- A renderização acontece no navegador: o build só injeta o JSON do cliente em `const CONFIG = __CONFIG_JSON__` e as meta tags em `<!--HEAD-->`. O JS do próprio `template.html` monta a página a partir de `CONFIG`
- Campos novos no JSON só aparecem no site se o JS do `template.html` os usar. Ao criar um campo, atualize também `clientes/exemplo.json` e o formulário do `gerador.html`
- O template insere textos via `innerHTML` sem escapar: não colocar HTML nem `<`/`>` soltos nos textos do JSON
- As meta tags do `<!--HEAD-->` são montadas em dois lugares: `build.js` e `gerador.html` (função que usa `TEMPLATE.replace`). Mudou um, mude o outro
- O build valida só JSON válido, slug (formato e unicidade) e os campos `nome`, `corPrincipal`, `corFundo` e `whatsapp`. As regras de contraste ficam apenas nos avisos do gerador (função `contraste`), então confira-as manualmente
- `build.js` também gera `dist/_redirects` (Netlify): links curtos `/<slug>/whatsapp|pedido|cardapio|local|instagram|avaliar|reserva` e, quando há `dominio`, as regras que fazem o domínio próprio servir `/<slug>/`. Esses links vão em QR codes impressos: não mudar os nomes
- A página raiz (`dist/index.html`) não lista os clientes, de propósito

## Automação
- Skills do projeto: `.claude/skills/novo-cliente` e `.claude/skills/atualizar-cliente`
- `.github/workflows/novo-cliente.yml`: uma issue com o rótulo `novo-cliente` (formulário em `.github/ISSUE_TEMPLATE/`) dispara o Claude, que segue a skill `novo-cliente` sem fazer perguntas e abre um PR na branch `cliente/<slug>`
- `git push` sempre pede confirmação (`.claude/settings.json`)

## Regras para o JSON do cliente
- `slug`: minúsculas, números e hífen; igual ao nome do arquivo; único
- `whatsapp`: só dígitos, formato `55` + DDD + número (12 ou 13 dígitos)
- Cores em hex `#RRGGBB`. `corPrincipal` precisa ter contraste ≥ 2.6 com branco (texto dos botões é branco). `corFundo` precisa ser escura (contraste ≥ 4.5 com branco). `corClara` é um tom quase branco da cor principal
- `fonteTitulo` e `fonteTexto`: nomes exatos do Google Fonts. Preferir as listas de `FONTES_TITULO` e `FONTES_TEXTO` em `gerador.html`
- `estiloBotao`: `redondo` | `suave` | `quadrado`
- `horarios`: chaves "0" (domingo) a "6" (sábado); valor `"HH:MM-HH:MM"` ou `null` (fechado). Passar da meia-noite é permitido (`"18:00-01:00"`)
- `wifi` e `cupom`: objeto ou `null`. `promocao`: texto ou `""`
- Campos sem informação ficam `""`. Nunca inventar links, telefones, preços ou endereços: se não foi informado, deixar vazio e avisar
- Textos em português do Brasil, curtos e sem exagero

## Temas de referência (ponto de partida quando não há identidade visual)
Regional, Pizzaria, Hamburgueria, Japonês, Açaí, Café, Peixaria: veja o objeto `TEMAS` em `gerador.html`.

## Imagens
- Logo: PNG com fundo transparente. Fotos: JPG, até ~400 KB, capa com ~1600px de largura
- Nome dos arquivos em minúsculas, sem acento nem espaço
- Para escolher cores a partir do logo, abra a imagem e use as cores dominantes respeitando as regras de contraste acima

## Verificação obrigatória
Depois de qualquer mudança, rode `node build.js`. Ele precisa terminar sem a seção "✖ Erros". Não commitar se falhar.

## Git
- Mensagens de commit em português: `cliente: adiciona <nome>` / `cliente: atualiza <nome> (<o que mudou>)` / `template: <mudança>`
- Mudanças no `template.html` afetam todos os clientes: descreva o impacto no PR
