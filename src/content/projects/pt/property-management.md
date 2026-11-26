---
title: Aplicação de gestão imobiliária
kind: Projeto privado · MVP em desenvolvimento
summary: Administrar unidades alugadas exige manter coerentes os contratos, as leituras de medidores, os custos de energia e as cobranças mensais. Estou desenvolvendo o MVP de uma aplicação para isso, com backend em ASP.NET Core e PostgreSQL.
order: 3
stack: [ASP.NET Core, PostgreSQL, Docker, CI/CD]
confidential: true
clientWork: false
---

## A necessidade

Administrar unidades alugadas envolve acompanhar os contratos e suas mudanças
ao longo do tempo, as leituras de medidores e a energia de cada unidade, e as
cobranças mensais e os pagamentos que decorrem delas. Esses números dependem uns
dos outros: uma leitura gera um valor de energia, que entra numa cobrança. As
correções precisam continuar rastreáveis, em vez de sobrescrever o que foi
registrado.

## Meu papel

Estou projetando e desenvolvendo a aplicação, do modelo de dados à API.
Trabalho com agentes de programação sob minha supervisão; meu papel é definir
as regras a partir de uma especificação escrita, revisar cada mudança e
verificá-la com testes automatizados.

## Decisões técnicas

- **Registros só de inserção, garantidos pelo banco de dados.** O log de
  auditoria e os registros que devem ser permanentes podem ser incluídos, mas
  não alterados nem apagados pela aplicação: o usuário de banco dela não tem
  permissão para atualizá-los ou excluí-los. A garantia está nas permissões do
  banco, não só no código, e um teste de arquitetura confere que todo registro
  só de inserção está coberto.
- **Dinheiro em decimal, com uma regra de arredondamento explícita.** Os
  valores são armazenados e calculados em decimal, nunca em ponto flutuante.
  Uma única função de arredondamento, para duas casas com o meio centavo
  arredondado para longe de zero, é usada em todo o código, e a regra de
  arredondamento é registrada junto com o cálculo de cada cobrança.
- **Login com TOTP.** As contas são criadas por convite. O primeiro acesso
  configura uma senha de uso único baseada em tempo, com códigos de
  recuperação, e cada login seguinte tem duas etapas.

## Qualidade e estado atual

O código tem testes de unidade, integração e arquitetura; os testes de
integração rodam contra um PostgreSQL real. É um projeto privado e um MVP em
desenvolvimento; esta página não afirma nada sobre implantação ou uso.

## Evidências

O código é privado. Posso apresentar essas decisões numa entrevista.
