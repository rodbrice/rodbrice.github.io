---
title: Plataforma de gestão imobiliária
kind: Backend e arquitetura de software
summary: O backend do MVP de uma plataforma de gestão imobiliária, de moradores e contratos a leituras de medidor, cobrança mensal, pagamentos e despesas, construído como monólito modular em .NET 10.
order: 2
stack: [C#, .NET 10, ASP.NET Core, ASP.NET Core Identity, EF Core, PostgreSQL]
confidential: true
---

## O problema

Administrar unidades de aluguel exige manter contratos, leituras de medidor,
tarifas, cobranças mensais, pagamentos e despesas coerentes entre si, mês após
mês. Erros custam caro: uma leitura errada ou um pagamento parcial perdido vai
direto para a conta do morador, e precisa ser explicado.

## Abordagem: primeiro uma especificação testável

Antes de qualquer código de backend, o MVP virou uma especificação precisa o
bastante para ser implementada sem inventar regras: modelo de dados e
relacionamentos, estados e transições, invariantes de domínio, o contrato de
cada operação e fórmulas explícitas com exemplos numéricos e testes de aceite
para cada cálculo crítico.

## Arquitetura

Um monólito modular em .NET 10 e ASP.NET Core: uma única aplicação para
deploy, dividida em módulos com fronteiras explícitas (organização e unidades,
pessoas e contratos, leituras e tarifas, cobrança, pagamentos, despesas). EF
Core e PostgreSQL cuidam da persistência e das migrations; o ASP.NET Core
Identity cuida das contas, com autenticação em dois fatores.

## Decisões técnicas

- **Mês fechado é imutável.** As tarifas e leituras usadas numa cobrança ficam
  congeladas com ela; uma correção posterior cria uma nova versão em vez de
  reescrever o histórico.
- **Pagamentos são alocações.** Pagamentos parciais, estornos e créditos são
  registrados como alocações contra cobranças, nunca como edição de um saldo,
  e cada valor pode ser rastreado até a origem.
- **Escritas idempotentes e transacionais.** Toda operação que mexe com
  dinheiro roda numa única transação e pode ser repetida com segurança: uma
  requisição repetida não cobra nem paga duas vezes.
- **Auditoria e dados pessoais.** Alterações sensíveis são auditadas, e os
  dados pessoais são tratados conforme as regras de proteção de dados.

## Resultado

Um backend que cobre o ciclo mensal inteiro, das leituras ao fechamento,
cobrança e pagamentos, com os testes de aceite da especificação como definição
de pronto.
