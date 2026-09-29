---
title: TheOne
kind: Multiplayer game systems
summary: A first-person dark fantasy survival game in Unity 6, with a dedicated authoritative server, client-side prediction and physical melee combat.
order: 3
stack: [C#, Unity 6, FishNet, Blender]
---

## The project

TheOne is a first-person survival game set in a dark fantasy world, built with
Unity 6 and the FishNet networking library. It is where I work on problems that
business software rarely raises: real-time networking, animation and physical
combat, all under a tight frame budget.

## Architecture

- **Dedicated authoritative server.** The server owns the game state and
  validates every action; a client never decides on its own whether a hit
  landed.
- **Client-side prediction.** The local player moves and acts immediately and is
  reconciled with the server state, so the game stays responsive despite
  latency.
- **Code split by domain.** Combat, body, items and AI live in separate
  assemblies, each with its own tests.

## Systems

- **Melee combat with hit capsules.** Hits are detected with capsules along a
  baked blade shape instead of generic physics collisions, which keeps them
  precise and cheap enough for the server to check.
- **Hand and foot IK** keeps hands on the weapon and feet planted on uneven
  ground.
- **Armour with durability and wounds.** Armour wears down as it absorbs hits,
  and damage that gets through leaves wounds on the body.
- **Standardised skeleton pipeline.** A Blender script brings every character
  rig onto one skeleton, so characters can be swapped from a menu without
  redoing their animations.

## Engineering practice

A selective EditMode test gate runs the tests of the parts a change touches
before it is merged, which keeps feedback fast as the project grows.
