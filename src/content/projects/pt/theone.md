---
title: TheOne
kind: Sistemas de jogo multiplayer
summary: Um jogo de sobrevivência em primeira pessoa, de fantasia sombria, em Unity 6, com servidor dedicado autoritativo, predição no cliente e combate corpo a corpo físico.
order: 3
stack: [C#, Unity 6, FishNet, Blender]
---

## O projeto

TheOne é um jogo de sobrevivência em primeira pessoa num mundo de fantasia
sombria, feito com Unity 6 e a biblioteca de rede FishNet. É onde eu trabalho
problemas que software de negócio raramente traz: rede em tempo real, animação
e combate físico, tudo dentro de um orçamento de frame apertado.

## Arquitetura

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
