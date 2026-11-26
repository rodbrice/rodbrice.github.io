---
title: Sistema de gestão de operações em campo
kind: Projeto privado para cliente · Validação final com o cliente
summary: As equipes registravam o trabalho diário em papel, e o escritório redigitava os dados em planilhas. Projetei e implementei fluxos no tablet offline e no escritório para ligar o registro à revisão.
order: 1
stack: [ASP.NET Core, PostgreSQL, React, TypeScript, Docker]
confidential: true
---

## O problema

Em uma empresa de manutenção industrial, os chefes de equipe preenchiam
relatórios diários em papel. Uma profissional do escritório redigitava os dados
em planilhas para preparar folhas de medição, documentos para clientes e dados
prontos para inserção no SAP. O registro em campo e a revisão no escritório
exigiam ferramentas diferentes, mas precisavam compartilhar as informações.

## Meu papel e descoberta

Conversei diretamente com a pessoa responsável pela contabilidade para definir
as regras e validar protótipos interativos antes da implementação. Projetei e
desenvolvi o fluxo no tablet, o backend e a aplicação de escritório. Durante o
desenvolvimento, usei agentes de programação sob minha supervisão, com revisão
de código e testes automatizados.

## Do campo ao escritório

- **Em campo:** os chefes de equipe podem registrar equipes, horas, períodos
  de espera, informações de segurança e assinaturas no tablet. A interface
  considera o uso com luvas, e o registro funciona sem conexão.
- **No escritório:** os relatórios entram numa fila de revisão e validação. A
  aplicação oferece tarifas, alocação por posições de encomenda, folhas de
  medição, exportação em PDF e Excel e dados preparados para o SAP.

## Decisões de engenharia

O registro offline atende à restrição de conectividade em campo; o uso com
luvas orienta a interação no tablet. Separar o registro da validação permite
conferir os relatórios antes de gerar documentos. Os formatos de saída seguem
o fluxo de trabalho do escritório.

## Qualidade e estado atual

A implementação inclui testes automatizados de integração, frontend e ponta a
ponta: mais de 900 testes de integração, mais de 2.300 de frontend e mais de
100 de ponta a ponta, além de mais de 60 decisões de arquitetura documentadas
(novembro de 2026). O cliente está testando o sistema na fase final de
validação. Ainda não há confirmação de entrada em produção nem de impacto
operacional.

## Aprendizado e evidências

Validar as regras contábeis com quem as usa me ajudou a transformar o processo
em papel em fluxos concretos para o campo e o escritório. Este é um projeto
privado para cliente; posso apresentar a arquitetura em uma conversa. O código,
as telas e os dados do cliente permanecem confidenciais.
