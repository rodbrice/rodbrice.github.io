---
title: Application de gestion immobilière
kind: Backend d’application métier
summary: Administrer des logements loués exige de garder cohérents les contrats, les relevés de compteurs, les coûts d’énergie et les charges mensuelles. Je développe le MVP d’une application à cet effet, avec un backend ASP.NET Core et PostgreSQL.
problem: "Contrats, relevés de compteurs, coûts d’énergie et charges mensuelles des logements loués doivent rester cohérents."
contribution: "Je conçois et développe l’application, du modèle de données à l’API."
status: mvpInDevelopment
order: 3
stack: [ASP.NET Core, PostgreSQL, Docker, CI/CD]
confidential: true
clientWork: false
---

## Le besoin

Administrer des logements loués implique de suivre les contrats et leurs
évolutions, les relevés de compteurs et l’énergie consommée par chaque logement,
ainsi que les charges mensuelles et les paiements qui en découlent. Ces chiffres
dépendent les uns des autres : un relevé donne un montant d’énergie, qui entre
dans une charge. Les corrections doivent rester traçables au lieu d’écraser ce
qui a été enregistré.

## Mon rôle

Je conçois et développe l’application, du modèle de données à l’API. Je
travaille avec des agents de programmation sous ma supervision ; mon rôle est de
définir les règles à partir d’une spécification écrite, de relire chaque
changement et de le vérifier par des tests automatisés.

## Choix techniques

- **Des enregistrements en insertion seule, garantis par la base de données.**
  Le journal d’audit et les enregistrements destinés à rester définitifs peuvent
  être ajoutés, mais ni modifiés ni supprimés par l’application : son
  utilisateur de base de données n’a pas le droit de les mettre à jour ou de les
  supprimer. La garantie repose sur les permissions de la base, pas seulement
  sur le code, et un test d’architecture vérifie que chaque enregistrement en
  insertion seule est couvert.
- **L’argent en décimal, avec une règle d’arrondi explicite.** Les montants sont
  stockés et calculés en décimal, jamais en virgule flottante. Une seule
  fonction d’arrondi, à deux décimales avec les demis arrondis en s’éloignant de
  zéro, est utilisée partout, et la règle d’arrondi est enregistrée avec le calcul de
  chaque charge.
- **Connexion avec TOTP.** Les comptes sont créés sur invitation. La première
  connexion configure un mot de passe à usage unique basé sur le temps, avec des
  codes de récupération, et chaque connexion suivante se fait en deux étapes.

## Qualité et état actuel

Le code a des tests unitaires, d’intégration et d’architecture ; les tests
d’intégration s’exécutent sur une vraie base PostgreSQL. Il s’agit d’un projet
privé et d’un MVP en développement ; cette page n’affirme rien sur un
déploiement ou une utilisation.

## Ce que j’ai appris et prochaines étapes

Écrire les règles avant le code m’a donné une référence concrète pour relire
chaque changement. Les règles qui ne doivent jamais être enfreintes, comme les
enregistrements en insertion seule et l’arrondi des montants, inspirent plus
confiance quand la base de données et les tests les imposent, plutôt que la
seule relecture. La prochaine étape est de terminer le MVP ; il n’a pas encore
d’utilisateurs.

## Éléments vérifiables

Le code est privé. Je peux présenter ces choix lors d’un entretien.
