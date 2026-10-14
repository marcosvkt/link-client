---
name: atualizar-cliente
description: Altera dados de um restaurante já cadastrado (horários, promoção, links, cores, pratos, fotos). Use quando pedirem mudança no site de um cliente existente.
argument-hint: "<slug ou nome do cliente> <o que mudar>"
---

# Atualizar cliente

Pedido: $ARGUMENTS

1. Encontre o cliente em `clientes/` pelo slug ou pelo campo `nome`. Se houver mais de um parecido, pergunte qual.
2. Aplique só a mudança pedida, mantendo o resto do arquivo igual. Imagens novas vão para `imagens/<slug>/`.
3. Siga as regras do CLAUDE.md (formato de horários, WhatsApp, contraste de cores, não inventar dados).
4. Rode `node build.js` e corrija erros.
5. Mostre ao usuário um resumo do antes → depois e pergunte se pode fazer commit e push com a mensagem `cliente: atualiza <nome> (<mudança>)`.
