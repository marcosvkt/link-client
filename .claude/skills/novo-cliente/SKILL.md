---
name: novo-cliente
description: Cria o site de um novo restaurante (JSON do cliente, imagens, cores e fontes) e valida o build. Use quando pedirem para adicionar ou cadastrar um cliente/restaurante novo.
argument-hint: "<nome do restaurante> [informações, links, caminho do logo...]"
---

# Novo cliente

Informações recebidas: $ARGUMENTS

## Passos

1. **Reunir dados.** Extraia das informações acima (e de arquivos ou links citados): nome, tipo de cozinha, slogan, WhatsApp, telefone, Instagram, links de delivery, cardápio, reserva, avaliação no Google, endereço(s), horários, pratos em destaque, promoção, cupom, Wi-Fi, domínio próprio.
   - Obrigatórios: **nome** e **WhatsApp**. Se faltarem, pergunte antes de continuar.
   - Para o resto, não invente: deixe `""` e liste no final o que ficou faltando.
   - Se houver site ou cardápio online, pode consultar para pegar endereço, horários e pratos.

2. **Slug.** Gere a partir do nome (minúsculas, sem acento, hífens). Confirme que `clientes/<slug>.json` ainda não existe.

3. **Imagens.** Copie logo e fotos informadas para `imagens/<slug>/` com nomes simples (`logo.png`, `capa.jpg`, `prato-1.jpg`...). Se alguma foto passar de ~500 KB e houver ferramenta disponível (`sips`, `magick`, `cwebp` ou Python com Pillow), reduza para no máximo 1600px de largura. Sem foto de capa, use uma foto do Unsplash adequada ao tipo de cozinha e avise.

4. **Identidade visual.**
   - Se houver logo: abra a imagem, identifique as cores dominantes e defina `corPrincipal`, `corFundo` e `corClara` seguindo as regras de contraste do CLAUDE.md.
   - Sem logo: parta do tema de `TEMAS` (em `gerador.html`) mais próximo do tipo de cozinha.
   - Escolha `fonteTitulo`, `fonteTexto` e `estiloBotao` que combinem com o estilo do restaurante (ex.: hamburgueria → Bebas Neue + quadrado; café → Fraunces + suave).

5. **Criar o JSON.** Escreva `clientes/<slug>.json` com TODOS os campos de `clientes/exemplo.json`, na mesma ordem.

6. **Validar.** Rode `node build.js`. Corrija até não haver erros.

7. **Resumo final** para o usuário:
   - Endereço do site: `/<slug>/` e links curtos (`/<slug>/whatsapp`, `/pedido`, `/cardapio`, `/local`, `/avaliar`, `/reserva`)
   - Paleta e fontes escolhidas, com uma frase sobre o porquê
   - Lista do que ficou faltando para completar
   - Pergunte se pode fazer commit e push (não faça sem confirmação, a menos que o pedido já autorize)
