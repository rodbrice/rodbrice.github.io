---
title: Ordres de travail et interventions terrain
kind: Application métier full stack
summary: Une application web pour les ordres de travail, les rapports journaliers de terrain et le suivi des coûts sur un site industriel, avec une application tablette pour l’équipe de terrain qui fonctionne hors ligne.
order: 1
stack: [C#, ASP.NET Core, React, TypeScript, PWA, PostgreSQL, Docker]
confidential: true
---

## Le problème

Le travail sur un site industriel était suivi avec des formulaires papier et
une chaîne de tableurs : ordres de travail, présences, rapports journaliers et
les décomptes de coûts établis à partir d’eux. Chaque chiffre était recopié à
la main d’un document à l’autre, les erreurs passaient inaperçues et personne
n’avait une vue unique de ce qui avait été fait, par qui et sur quel ordre.

## Ce que j’ai construit

- **Une application tablette pour l’équipe de terrain** : un rapport
  journalier pas à pas, avec de grandes zones tactiles et un enregistrement
  automatique, qui fonctionne sans connexion et se synchronise à son retour.
- **Un back-office de validation et de comptabilité** : chaque rapport passe
  par des états clairs (brouillon, soumis, validé, comptabilisé), et les
  permissions par rôle définissent qui peut faire quoi à chaque étape.
- **Des exports** PDF et Excel pour les documents qui doivent encore sortir du
  système.

## Architecture

Un monolithe modulaire en ASP.NET Core, avec PostgreSQL comme source unique de
vérité et une progressive web app en React et TypeScript comme client. Chaque
domaine métier (ordres, présences, rapports, comptabilité) est un module avec
sa propre frontière, ce qui garde une seule unité de déploiement tout en
laissant la possibilité de la découper plus tard. L’ensemble tourne avec
Docker Compose.

## Décisions techniques

- **Hors ligne dès la conception.** Les brouillons de rapport sont stockés dans
  l’IndexedDB du navigateur, derrière un service worker. Le serveur reste
  l’autorité : la synchronisation résout les conflits de manière explicite au
  lieu de laisser gagner la dernière écriture.
- **Automatique, mais modifiable.** Heures, totaux et budgets restants sont
  calculés, mais toute personne autorisée peut corriger une valeur calculée.
  La valeur d’origine est conservée, un motif est obligatoire et la
  modification est inscrite dans un journal d’audit ; un nouveau calcul
  n’écrase jamais une correction manuelle sans prévenir.
- **Les règles métier avant le code.** Les formules cachées dans les tableurs
  existants ont d’abord été documentées et transformées en tests, pour que
  l’application reproduise les chiffres auxquels l’équipe fait déjà confiance.
- **Des décisions documentées.** La stack, la stratégie hors ligne et le modèle
  de correction et d’audit sont consignés dans des architecture decision
  records (ADR).

## Résultat

Le chemin du rapport de terrain jusqu’au décompte de coûts devient un flux
unique et traçable, au lieu d’une suite de documents ressaisis, et chaque
correction manuelle reste visible et justifiée.
