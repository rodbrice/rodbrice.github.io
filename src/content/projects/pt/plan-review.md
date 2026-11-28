---
title: plan-review — revisão de risco de mudanças no Terraform
kind: Ferramenta de linha de comando em Python
summary: Uma mudança de infraestrutura arriscada pode passar despercebida num plano Terraform longo. O plan-review é uma ferramenta de linha de comando em Python, em fase inicial, que lê um plano salvo e aponta o que a mudança destrói, substitui ou expõe.
problem: "Uma mudança de infraestrutura arriscada pode passar despercebida num plano Terraform longo."
contribution: "Escolhi o escopo, defini as regras e conferi cada marco com saídas reais do Terraform."
status: earlyDevelopment
order: 4
featured: true
stack: [Python, Terraform, pytest]
source: https://github.com/rodbrice/plan-review
---

## O problema

Um `terraform plan` longo esconde as poucas linhas que importam — um banco de
dados que será substituído, uma política IAM que ganha um curinga — entre
centenas de mudanças de atributos inofensivas. Os scanners estáticos verificam
se a configuração final está mal configurada. Eles não respondem o que esta
mudança específica destrói, substitui ou amplia em relação ao que está rodando
hoje.

## Meu papel

É um projeto público meu. Escolhi o escopo, defini as regras e seus limites e
conferi cada marco com saídas reais do Terraform antes de integrá-lo. Trabalhei
com agentes de programação sob minha supervisão e uma etapa de revisão
automatizada; meu papel foi o desenho, a revisão de cada mudança e a validação.

## A solução

A ferramenta lê o JSON que `terraform show -json` gera para um plano salvo e
aplica cinco regras:

- **R1 e R2:** um recurso que guarda dados, como um banco de dados ou um
  bucket, é destruído ou substituído.
- **R3:** uma política IAM ganha uma ação ou um recurso com curinga.
- **R4:** uma regra de entrada abre uma porta para toda a internet.
- **R5:** um bucket perde a proteção de acesso público ou se torna público.

O relatório sai em texto, Markdown ou JSON. Um arquivo `.plan-review.yml` pode
ignorar uma regra ou mudar sua severidade, e o código de saída informa a um
pipeline se houve um achado bloqueante.

## Decisões técnicas

- **Revisar o delta, não a configuração.** O plano é o único artefato que traz
  o valor atual e o valor planejado de cada recurso. Por isso a ferramenta
  nunca executa o Terraform e não precisa de credenciais de nuvem; uma
  configuração errada que o plano não altera fica fora do escopo.
- **Explícito em vez de heurístico.** Os tipos de recurso que guardam dados
  formam uma lista explícita e documentada. Cada regra é uma função pura de uma
  mudança de recurso para achados, testada com casos positivos e negativos.
- **Planos reais como dados de teste.** Os planos de exemplo são saídas reais
  do Terraform, geradas offline a partir de configurações mínimas com
  credenciais fictícias. A integração contínua os gera de novo e falha se
  divergirem das fontes.
- **Nada sensível nos relatórios.** Os achados citam só o que um revisor
  precisa e nunca um valor que o Terraform marca como sensível.

## Qualidade e validação

A integração contínua roda a formatação e o lint (ruff), a checagem de tipos
(mypy) e a suíte pytest no Python 3.12 e 3.13. Cada marco tem um registro de
validação com os comandos executados e os resultados observados.

## Estado atual e limites

Desenvolvimento inicial. A ferramenta de linha de comando com as regras R1 a
R5, o arquivo de configuração e os três formatos de relatório estão prontos.
Uma GitHub Action que comenta em pull requests e uma primeira versão publicada
são o próximo marco; nenhuma das duas existe ainda. As regras cobrem apenas
tipos de recurso da AWS. Não substitui Checkov, Trivy ou tfsec, nem é um motor
de políticas ou um estimador de custos.

## O que aprendi

Escrever o que a ferramenta não é foi tão útil quanto escrever suas regras:
isso manteve o escopo pequeno o bastante para testar cada regra com planos
reais.

## Evidências

- [Código-fonte e README](https://github.com/rodbrice/plan-review)
- [Registro de decisão de arquitetura](https://github.com/rodbrice/plan-review/blob/main/docs/adr/0001-review-the-plan-delta-not-the-state.md)
- [Registros de validação](https://github.com/rodbrice/plan-review/tree/main/docs/validation)
- [Planos de exemplo fictícios](https://github.com/rodbrice/plan-review/tree/main/fixtures)
