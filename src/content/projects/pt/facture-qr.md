---
title: Facture QR — faturação com QR-bill suíço
kind: Núcleo de faturação QR-bill
summary: Um QR-bill suíço precisa seguir regras rígidas de endereço, referência e IBAN. Estou construindo em pequenas etapas verificadas um núcleo de faturação em .NET — biblioteca QR-bill, armazenamento em PostgreSQL, API HTTP local — e publico as verificações de cada etapa.
problem: "Um QR-bill suíço precisa seguir regras rígidas de endereço, referência e IBAN."
contribution: "Defini o escopo, tomei as decisões de projeto e conferi cada etapa contra a norma."
status: inDevelopment
order: 2
stack: [C#, .NET, ASP.NET Core, PostgreSQL, EF Core]
source: https://github.com/rodbrice/facture-qr
---

## O problema

Desde setembro de 2022, o QR-bill é o único boleto de pagamento aceito na
Suíça e em Liechtenstein. Gerá-lo corretamente exige seguir as Implementation
Guidelines da SIX: endereços estruturados, QR-IBAN com referência QR ou IBAN
com Creditor Reference, conteúdo exato no Swiss QR Code e layout fixo. Uma
seção de pagamento que viola essas regras pode ser recusada pelos bancos. O
Facture QR é uma pequena ferramenta de faturação para autônomos que acerta esse
núcleo antes de existir qualquer tela.

## Meu papel

É um projeto público meu. Defini o escopo e o que fica de fora, tomei as
decisões de projeto registradas nos ADRs e conferi cada etapa contra a norma
antes de integrá-la. Trabalhei com agentes de programação sob minha supervisão
e uma etapa de revisão automatizada; meu papel foi definir as regras, revisar
as mudanças e verificar os resultados.

## Abordagem e restrições

O repositório cresce em pequenas unidades, cada uma com um registro de
validação: primeiro a biblioteca QR-bill, depois o modelo de fatura e seu
armazenamento, depois uma API HTTP. O escopo é estreito de propósito: só CHF,
sem lógica de IVA e apenas dados fictícios tirados dos exemplos das diretrizes
da SIX.

## O que existe hoje

- **Biblioteca QR-bill:** validação de IBAN e QR-IBAN suíços, endereços
  estruturados, referência QR e Creditor Reference, e geração da seção de
  pagamento em PDF ou PNG.
- **Modelo de fatura:** a fatura passa de rascunho a emitida e a paga, e só um
  rascunho pode mudar. O total é sempre a soma das linhas e fica dentro do
  limite de valor do QR-bill.
- **Armazenamento:** PostgreSQL com EF Core; o esquema só muda por migrações.
- **API HTTP local:** clientes, rascunhos com suas linhas, emissão, registro do
  pagamento e a fatura em PDF A4 com o QR-bill. Os erros seguem o formato
  ProblemDetails, e o documento OpenAPI está versionado.

## Decisões técnicas

- **Números de fatura sem duplicatas nem lacunas.** Cada ano tem uma linha de
  contador, incrementada e bloqueada dentro da transação que emite a fatura.
  Duas faturas emitidas no mesmo instante nunca recebem o mesmo número, e uma
  emissão que falha desfaz o incremento. Descartei `MAX + 1` (duplicatas sob
  concorrência), uma sequência do banco (lacunas após rollback) e transações
  serializáveis com novas tentativas (um laço de repetição em cada caminho de
  emissão). O custo é que emissões do mesmo ano esperam umas pelas outras
  durante uma transação curta.
- **Regras no domínio, repetidas onde os dados poderiam se corromper.** As
  regras da fatura ficam em classes C# simples; o banco repete as mais críticas
  com restrições de verificação e um índice único no número.
- **Uma biblioteca consolidada para o layout.** A seção de pagamento é gerada
  por uma biblioteca open source atrás de uma única classe, para que o projeto
  se concentre na validação e não em redesenhar um layout regulamentado.

## Qualidade e validação

- O conteúdo dos QR codes é comparado com conteúdos esperados escritos à mão a
  partir da norma, decodificado de volta e lido por um decodificador QR
  independente.
- Os testes da API leem de volta o QR code do PDF gerado com outro
  decodificador e o comparam com a fatura.
- Um teste de concorrência emite 40 rascunhos ao mesmo tempo num PostgreSQL
  real e verifica que os números vão exatamente de 1 a 40. Trocar a alocação por
  um `MAX + 1` ingênuo fez esse teste falhar, como registram as notas de
  validação.
- A integração contínua compila com avisos tratados como erros, verifica a
  formatação, executa os testes e aplica as migrações num banco vazio.

## Estado atual e limites

Em desenvolvimento. A validação dos exemplos no portal da SIX ainda está
pendente. Ainda não há interface, e a API não tem autenticação: foi pensada
para uso local por uma pessoa. Não é um serviço de faturação hospedado. Uma
interface em React e a conciliação de extratos bancários são próximos passos
planejados, não funcionalidades.

## O que aprendi

Trabalhar a partir de uma norma regulamentada me levou a escrever as evidências
antes das funcionalidades. Registrar cada verificação com seu comando e
resultado também deixa claro o que está verificado e o que ainda está pendente.

## Evidências

- [Código-fonte e README](https://github.com/rodbrice/facture-qr)
- [Registros de decisões de arquitetura (ADR)](https://github.com/rodbrice/facture-qr/tree/main/docs/adr)
- [Registros de validação](https://github.com/rodbrice/facture-qr/tree/main/docs/validation)
- [Exemplos fictícios](https://github.com/rodbrice/facture-qr/tree/main/docs/samples)
