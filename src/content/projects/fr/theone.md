---
title: TheOne
kind: Systèmes de jeu multijoueur
summary: Un jeu de survie à la première personne dans un univers de dark fantasy, en Unity 6, avec un serveur dédié autoritaire, une prédiction côté client et un combat au corps à corps physique.
order: 3
stack: [C#, Unity 6, FishNet, Blender]
---

## Le projet

TheOne est un jeu de survie à la première personne dans un monde de dark
fantasy, développé avec Unity 6 et la bibliothèque réseau FishNet. C’est là que
je travaille des problèmes que le logiciel métier pose rarement : réseau en
temps réel, animation et combat physique, le tout dans un budget de frame
serré.

## Architecture

- **Serveur dédié autoritaire.** Le serveur détient l’état du jeu et valide
  chaque action ; un client ne décide jamais seul si un coup a porté.
- **Prédiction côté client.** Le joueur local se déplace et agit tout de suite,
  puis est réconcilié avec l’état du serveur, pour que le jeu reste réactif
  malgré la latence.
- **Code découpé par domaine.** Combat, corps, objets et IA vivent dans des
  assemblies séparées, chacune avec ses propres tests.

## Systèmes

- **Combat au corps à corps par capsules de touche.** Les coups sont détectés
  avec des capsules le long d’une forme de lame précalculée (baked), plutôt
  qu’avec des collisions physiques génériques, ce qui les garde précis et assez
  légers pour être vérifiés par le serveur.
- **IK des mains et des pieds** pour garder les mains sur l’arme et les pieds
  posés sur un terrain irrégulier.
- **Armure avec durabilité et blessures.** L’armure s’use en absorbant les
  coups, et les dégâts qui passent laissent des blessures sur le corps.
- **Pipeline de squelette standardisé.** Un script Blender ramène le rig de
  chaque personnage sur un squelette unique, et les personnages peuvent être
  changés depuis un menu sans refaire leurs animations.

## Pratique d’ingénierie

Une barrière sélective de tests EditMode exécute les tests des parties
touchées par un changement avant son merge, ce qui garde un retour rapide à
mesure que le projet grandit.
