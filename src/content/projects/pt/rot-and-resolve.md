---
title: "Rot & Resolve"
kind: Sistemas de jogo multiplayer
summary: Um jogo de sobrevivência em primeira pessoa, de fantasia sombria, em Unity 6, com servidor dedicado autoritativo, predição no cliente e combate corpo a corpo físico.
problem: "Rede em tempo real, animação e combate físico precisam caber num orçamento de frame apertado."
contribution: "Trabalho no servidor autoritativo, na predição no cliente e no combate corpo a corpo."
status: personal
order: 5
stack: [C#, Unity 6, FishNet, Blender]
---

## O projeto

Rot & Resolve é um jogo de sobrevivência em primeira pessoa num mundo de
fantasia sombria, feito com Unity 6 e a biblioteca de rede FishNet. É onde eu
trabalho problemas que software de negócio raramente traz: rede em tempo real,
animação e combate físico, tudo dentro de um orçamento de frame apertado.

## Meu papel

É meu projeto pessoal. Projeto e desenvolvo os sistemas descritos abaixo, do
servidor autoritativo e da predição no cliente ao combate corpo a corpo e às
ferramentas de personagens, junto com os testes de cada domínio.

## Decisões de arquitetura

- **Servidor dedicado autoritativo.** O servidor é dono do estado do jogo e
  valida cada ação; um cliente nunca decide sozinho se um golpe acertou.
- **Predição no cliente.** O jogador local se move e age na hora e é
  reconciliado com o estado do servidor, para o jogo continuar responsivo
  apesar da latência.
- **Código separado por domínio.** Combate, corpo, itens e IA ficam em
  assemblies separados, cada um com seus próprios testes.

## Sistemas

- **Combate corpo a corpo com cápsulas de acerto.** Os golpes são detectados
  com cápsulas ao longo de uma forma de lâmina pré-calculada (baked), em vez de
  colisões genéricas de física, o que os mantém precisos e baratos o bastante
  para o servidor verificar.
- **IK de mãos e pés** mantém as mãos na arma e os pés apoiados em terreno
  irregular.
- **Armadura com durabilidade e feridas.** A armadura se desgasta ao absorver
  golpes, e o dano que passa deixa feridas no corpo.
- **Pipeline de esqueleto padronizado.** Um script do Blender leva o rig de
  cada personagem para um único esqueleto, e os personagens podem ser trocados
  por um menu sem refazer as animações.

## Prática de engenharia

Um portão seletivo de testes EditMode roda os testes das partes afetadas por
uma mudança antes do merge, o que mantém o retorno rápido à medida que o
projeto cresce.

## Estado atual

Um projeto pessoal em desenvolvimento. O jogo não foi lançado.

## O que aprendi

Fazer do servidor a única autoridade me ensinou a decidir cedo qual lado é
dono de cada parte do estado, e o que o cliente pode apenas prever.

## Evidências

Código privado — apresentação disponível sob pedido.
