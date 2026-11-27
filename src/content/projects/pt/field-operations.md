---
title: Sistema de gestão de operações em campo
kind: Aplicação de campo e escritório
summary: As equipes registravam o trabalho diário em papel, e o escritório redigitava os dados em planilhas. Projetei e implementei fluxos no tablet offline e no escritório para ligar o registro à revisão.
problem: "As equipes registravam o trabalho diário em papel; o escritório redigitava tudo em planilhas."
contribution: "Projetei e desenvolvi o fluxo offline no tablet, o backend e a aplicação de escritório."
status: clientValidation
order: 1
featured: true
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

Trabalhei diretamente com o contador do cliente, a pessoa responsável pela
contabilidade no escritório. As regras foram definidas em rodadas de perguntas
e respostas por escrito, e cada resposta virou uma decisão registrada. Antes de
construir uma tela, eu submetia o protótipo interativo à revisão e à validação.
Quando o cliente pedia mudanças, eu transformava cada pedido em um plano de
pequenas entregas, cada uma testada separadamente. Projetei e desenvolvi o
fluxo no tablet, o backend e a aplicação de escritório. Durante o
desenvolvimento, usei agentes de programação sob minha supervisão, com revisão
de código e testes automatizados.

## Do campo ao escritório

- **Em campo:** os chefes de equipe podem registrar equipes, horas, períodos
  de espera, informações de segurança e assinaturas no tablet. A interface
  considera o uso com luvas, e o registro funciona sem conexão.
- **A fila de trabalho do escritório:** uma fila guiada leva cada relatório,
  passo a passo, até a contabilização. Os valores digitados pelo chefe de
  equipe são conferidos com os cadastros e associados, incluídos ou corrigidos;
  depois o relatório é revisado e contabilizado nas posições da encomenda do
  cliente, com uma tabela de preços cujos artigos têm um coeficiente.
- **Períodos fechados:** o mês termina com uma lista de verificação de
  fechamento; alterar a contabilidade de um mês fechado, ou contabilizar numa
  posição de encomenda fechada, exige um motivo.
- **Folhas de medição:** cada uma corresponde a uma única posição de encomenda
  e tem versões. Uma folha é regenerada enquanto aguarda o lançamento no SAP, e
  corrigida como nova versão depois de registrada no SAP.
- **Livro de encomendas:** saldos por posição de encomenda, avisos ao se
  aproximar do valor da encomenda, um alerta de custo não coberto que nunca
  bloqueia, e a conciliação com o export do SAP.
- **Em torno da rotina:** o diário de obra do cliente, as presenças com as
  regras de horas, os cadastros e as exportações em PDF e Excel.
- **Trilha de auditoria:** cada correção feita no escritório registra quem a
  fez, quando, o valor anterior e o novo, e o motivo. A pedido do cliente, os
  casos simples, como um primeiro registro, não pedem mais motivo; o sistema
  registra o seu.

## Decisões de engenharia

- **O servidor é a única fonte das regras.** As telas do escritório mostram o
  que a API responde, como os alertas de orçamento e a cobertura de custos, e
  nunca recalculam; cada regra existe num só lugar.
- **Papel assinado continua verdadeiro.** Quando uma correção altera o conteúdo
  de um papel que o cliente já assinou, a assinatura do cliente cai e o sistema
  pede para imprimir a nova edição e assiná-la de novo.
- **Fila offline no tablet.** Os relatórios aguardam numa fila no aparelho e
  sincronizam com o servidor quando a conexão volta.
- **Documentos em italiano, dados sem tradução.** Cada usuário escolhe italiano
  ou inglês para a interface, mas os documentos e as exportações são sempre em
  italiano, e os dados cadastrados nunca são traduzidos.

## Qualidade e estado atual

O trabalho foi entregue em mais de 230 pull requests desde setembro de 2026,
cada um validado pelos testes automatizados: mais de 900 testes de integração,
mais de 2.300 de frontend e mais de 110 de ponta a ponta, além de mais de 65
decisões de arquitetura documentadas (27 de novembro de 2026). O cliente está
testando o sistema na fase final de validação. Ainda não há confirmação de
entrada em produção nem de impacto operacional.

## Aprendizado e evidências

Validar as regras contábeis com quem as usa, uma pergunta e um protótipo de
cada vez, me ajudou a transformar o processo em papel em fluxos concretos para
o campo e o escritório. Este é um projeto privado para cliente; posso
apresentar a arquitetura em uma conversa. O código, as telas e os dados do
cliente permanecem confidenciais.
