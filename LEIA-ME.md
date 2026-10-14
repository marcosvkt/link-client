# Sites de restaurantes: processo automático

Cada cliente é **um arquivo** em `clientes/`. Quando você salva no GitHub, o Netlify gera e publica todos os sites sozinho, em cerca de 1 minuto.

```
clientes/          um .json por cliente (dados, cores, fontes, links)
imagens/<slug>/    logo e fotos de cada cliente
template.html      o layout (alterou aqui → muda para todos os clientes)
gerador.html       a ferramenta visual para criar clientes
build.js           monta os sites (roda no Netlify)
netlify.toml       configuração do Netlify
```

## Configuração inicial (uma vez só)

1. **GitHub:** crie um repositório **privado** (ex.: `sites-restaurantes`). Clique em *Add file → Upload files*, arraste todo o conteúdo desta pasta e clique em *Commit changes*.
2. **Netlify:** entre em netlify.com com a sua conta do GitHub. Vá em *Add new site → Import an existing project → GitHub* e escolha o repositório. Os campos de build já vêm do `netlify.toml`. Clique em *Deploy*.
3. **Seu domínio (recomendado):** em *Domain management → Add a domain*, adicione algo como `sites.icomanda.com.br`. Os clientes ficam em `sites.icomanda.com.br/nome-do-restaurante`.
4. O gerador fica em `seu-site/gerador`. Salve esse link nos favoritos.

## Para cada cliente novo (cerca de 15 minutos)

1. **Abra o gerador.** Clique em *Novo* e preencha o nome. O endereço (slug) é criado sozinho.
2. **Identidade visual:**
   - Envie o logo e clique em *Gerar paleta completa do logo*, ou escolha um *Tema pronto* (Pizzaria, Hamburgueria, Japonês, Açaí…) e ajuste.
   - Escolha a fonte dos títulos e a dos textos e o estilo dos botões.
   - Os avisos em laranja mostram se alguma cor ficou ilegível.
3. **Dados:** preencha WhatsApp, delivery, cardápio, unidades e horários, pratos em destaque e extras. A prévia ao lado atualiza em tempo real. Use *Celular* para conferir no tamanho do telefone.
4. **Publicar:**
   - Clique em **Baixar pacote para o GitHub** e descompacte o `.zip`. Ele traz `clientes/<slug>.json` e `imagens/<slug>/`.
   - No GitHub, clique em *Add file → Upload files*, arraste as pastas `clientes` e `imagens` e clique em *Commit*.
   - O site entra no ar em `seu-site/<slug>`.
5. **Editar depois:** baixe o `.json` do cliente no GitHub e use *Importar JSON* no gerador. Ou edite o arquivo direto no GitHub (ícone de lápis) para mudanças pequenas, como horário ou promoção.

> Se o build falhar, o Netlify mantém a versão anterior no ar e mostra o erro no log (ex.: "campo whatsapp vazio").

## Domínio próprio do cliente (opcional)

1. No gerador, preencha **Domínio próprio** (ex.: `pizzariabella.com.br`) e publique.
2. No Netlify, adicione o domínio em *Domain management → Add domain alias*. Faça o mesmo com a versão `www.`.
3. No registro.br (ou onde o domínio estiver), aponte o DNS como o Netlify mostrar. O HTTPS é ativado sozinho.

O `build.js` cria as regras para que `pizzariabella.com.br` abra o site do cliente.

## Links curtos (automáticos)

Todo cliente ganha estes links, sem configuração extra:

`/<slug>/whatsapp` · `/<slug>/pedido` · `/<slug>/cardapio` · `/<slug>/local` · `/<slug>/instagram` · `/<slug>/avaliar` · `/<slug>/reserva`

Com domínio próprio, também funcionam como `pizzariabella.com.br/whatsapp`. Use esses links nos QR codes: se o cliente trocar de número ou de app de delivery, você muda o JSON e o QR continua valendo.

## Alternativa sem GitHub

Use o botão **Baixar site (.html)**. Ele gera um arquivo único, com as imagens embutidas, que pode ser enviado para qualquer hospedagem (cPanel, Hostinger) ou arrastado no Netlify Drop.

## Testar no computador (opcional)

Com o Node instalado, rode `node build.js` e abra `dist/gerador/index.html` ou `dist/<slug>/index.html`.

## Automação com Claude Code

**No seu computador.** Clone o repositório, abra o terminal na pasta e rode `claude`. Depois use:
- `/novo-cliente Pizzaria Bella Napoli, WhatsApp 5592988887777, iFood https://..., logo em ~/Downloads/logo.png`
- `/atualizar-cliente bella-napoli horário de sábado agora até 02h`

O Claude cria o JSON, copia as imagens, escolhe cores e fontes, roda o build e pede confirmação antes do push. As regras do projeto ficam no `CLAUDE.md`.

**Pelo GitHub, sem abrir o terminal.**
1. Uma vez só: no terminal, dentro do repositório, rode `claude` e depois `/install-github-app`. Isso instala o app e salva a chave. Se preferir fazer à mão, crie o secret `ANTHROPIC_API_KEY` em *Settings → Secrets and variables → Actions*.
2. Em *Settings → Actions → General*, ative "Allow GitHub Actions to create and approve pull requests".
3. Para cada cliente: *Issues → New issue → Novo cliente*. Preencha o formulário e arraste o logo e as fotos.
4. O Claude monta o site e abre um PR. Confira a prévia que o Netlify gera no próprio PR e clique em *Merge*. O site entra no ar.
