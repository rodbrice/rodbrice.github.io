---
title: Ordens de serviço e operações de campo
kind: Aplicação de negócio full stack
summary: Uma aplicação web para ordens de serviço, relatórios diários de campo e controle de custos num site industrial, com um app de tablet para a equipe de campo que funciona offline.
order: 1
stack: [C#, ASP.NET Core, React, TypeScript, PWA, PostgreSQL, Docker]
confidential: true
---

## O problema

O trabalho num site industrial era acompanhado com formulários em papel e uma
cadeia de planilhas: ordens de serviço, presença, relatórios diários e os
demonstrativos de custo montados a partir deles. Cada número era copiado à mão
de um documento para o outro, os erros passavam despercebidos e ninguém tinha
uma visão única do que foi feito, por quem e em qual ordem.

## O que eu construí

- **Um app de tablet para a equipe de campo**: um relatório diário passo a
  passo, com alvos de toque grandes e salvamento automático, que funciona sem
  conexão e sincroniza quando ela volta.
- **Um back office para revisão e contabilidade**: cada relatório passa por
  estados claros (rascunho, enviado, revisado, contabilizado), e as permissões
  por papel definem quem pode fazer o quê em cada etapa.
- **Exportações** em PDF e Excel para os documentos que ainda precisam sair do
  sistema.

## Arquitetura

Um monólito modular em ASP.NET Core, com o PostgreSQL como fonte única da
verdade e um progressive web app em React e TypeScript como cliente. Cada área
de negócio (ordens, presença, relatórios, contabilidade) é um módulo com
fronteira própria, o que mantém uma única unidade de deploy e deixa espaço para
separar depois. O sistema inteiro roda com Docker Compose.

## Decisões técnicas

- **Offline desde o projeto.** Os rascunhos de relatório ficam no IndexedDB do
  navegador, atrás de um service worker. O servidor continua sendo a
  autoridade: a sincronização resolve conflitos de forma explícita, em vez de
  deixar a última escrita vencer.
- **Automático, mas editável.** Horas, totais e saldos de orçamento são
  calculados, mas quem tem permissão pode corrigir qualquer valor calculado. O
  valor original é mantido, o motivo é obrigatório e a alteração vai para um
  log de auditoria; recalcular nunca apaga uma correção manual sem avisar.
- **Regras de negócio antes do código.** As fórmulas escondidas nas planilhas
  existentes foram documentadas e viraram testes primeiro, para que a aplicação
  reproduza os números em que a equipe já confia.
- **Decisões registradas.** Stack, estratégia offline e o modelo de correção e
  auditoria estão documentados como registros de decisão de arquitetura (ADRs).

## Resultado

O caminho do relatório de campo até o demonstrativo de custo vira um fluxo
único e rastreável, em vez de uma série de documentos redigitados, e toda
correção manual fica visível e justificada.
