---
title: Plateforme de gestion immobilière
kind: Backend et architecture logicielle
summary: Le backend du MVP d’une plateforme de gestion immobilière, des locataires et contrats aux relevés de compteurs, à la facturation mensuelle, aux paiements et aux dépenses, construit comme un monolithe modulaire en .NET 10.
order: 2
stack: [C#, .NET 10, ASP.NET Core, ASP.NET Core Identity, EF Core, PostgreSQL]
confidential: true
---

## Le problème

Gérer des logements en location implique de garder cohérents entre eux les
contrats, les relevés de compteurs, les tarifs, les charges mensuelles, les
paiements et les dépenses, mois après mois. Les erreurs coûtent cher : un
relevé faux ou un paiement partiel perdu se retrouve directement sur la
facture d’un locataire, et doit être expliqué.

## Démarche : d’abord une spécification testable

Avant toute ligne de code backend, le MVP a été traduit en une spécification
assez précise pour être implémentée sans inventer de règles : modèle de
données et relations, états et transitions, invariants du domaine, contrat de
chaque opération, et formules explicites avec exemples chiffrés et tests
d’acceptation pour chaque calcul critique.

## Architecture

Un monolithe modulaire en .NET 10 et ASP.NET Core : une seule application à
déployer, découpée en modules aux frontières explicites (organisation et
logements, personnes et contrats, relevés et tarifs, facturation, paiements,
dépenses). EF Core et PostgreSQL gèrent la persistance et les migrations ;
ASP.NET Core Identity gère les comptes, avec une authentification à deux
facteurs.

## Décisions techniques

- **Un mois clôturé est immuable.** Les tarifs et relevés utilisés pour une
  facture sont figés avec elle ; une correction ultérieure crée une nouvelle
  version au lieu de réécrire l’historique.
- **Les paiements sont des affectations.** Paiements partiels, extournes et
  avoirs sont enregistrés comme des affectations sur des charges, jamais comme
  une modification de solde, et chaque montant peut être retracé jusqu’à son
  origine.
- **Écritures idempotentes et transactionnelles.** Chaque opération qui touche
  à l’argent s’exécute dans une seule transaction et peut être rejouée sans
  risque : une requête répétée ne facture ni ne paie deux fois.
- **Audit et données personnelles.** Les modifications sensibles sont
  auditées, et les données personnelles sont traitées selon les règles de
  protection des données.

## Résultat

Un backend qui couvre tout le cycle mensuel, des relevés à la clôture, à la
facturation et aux paiements, avec les tests d’acceptation de la
spécification comme définition de « terminé ».
