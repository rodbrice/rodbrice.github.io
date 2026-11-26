---
title: Système de gestion des opérations de chantier
kind: Application terrain et bureau
summary: Les chefs d’équipe consignaient le travail quotidien sur papier, puis le bureau le ressaisissait dans des tableurs. J’ai conçu et développé une saisie sur tablette utilisable hors ligne, reliée au contrôle au bureau.
problem: "Les chefs d’équipe consignaient le travail sur papier ; le bureau le ressaisissait dans des tableurs."
contribution: "J’ai conçu et développé la saisie sur tablette hors ligne, le backend et l’application de bureau."
status: clientValidation
order: 1
stack: [ASP.NET Core, PostgreSQL, React, TypeScript, Docker]
confidential: true
---

## Le problème

Dans une entreprise de maintenance industrielle, les chefs d’équipe
remplissaient leurs rapports quotidiens sur papier. Une personne au bureau
ressaisissait ensuite ces données dans des tableurs pour préparer les feuilles
de métrés, les documents destinés aux clients et les données prêtes à être
saisies dans SAP. La saisie sur le terrain et le contrôle au bureau demandaient
des outils différents, mais devaient partager les mêmes informations.

## Mon rôle et la découverte

J’ai échangé directement avec la personne chargée de la comptabilité pour
préciser les règles et valider des prototypes interactifs avant la réalisation.
J’ai conçu et développé le parcours tablette, le backend et l’application de
bureau. Pendant le développement, j’ai utilisé des agents de programmation sous
ma supervision, avec revue du code et tests automatisés.

## Du terrain au bureau

- **Sur le terrain :** les chefs d’équipe peuvent saisir les équipes, les
  heures, les temps d’attente, les informations de sécurité et les signatures
  sur tablette. L’interface tient compte du port de gants et la saisie fonctionne
  sans connexion.
- **Au bureau :** les rapports passent par une file de contrôle et de
  validation. L’application gère les tarifs, l’affectation aux postes de
  commande, les feuilles de métrés, les exports PDF et Excel et les données
  préparées pour SAP.

## Choix techniques

La saisie hors ligne répond aux contraintes de connexion sur le terrain ;
l’usage avec des gants guide les interactions sur tablette. La séparation entre
saisie et validation permet au bureau de vérifier les rapports avant de produire
les documents. Les formats de sortie suivent ce travail de bureau.

## Qualité et état actuel

L’implémentation comprend des tests automatisés d’intégration, du frontend et
de bout en bout : plus de 900 tests d’intégration, plus de 2 300 tests du
frontend et plus de 100 tests de bout en bout, avec plus de 60 décisions
d’architecture documentées (novembre 2026). Le client teste actuellement le
système dans sa phase finale de validation. Le déploiement en production et
l’impact opérationnel ne sont pas établis.

## Ce que j’ai appris et éléments vérifiables

Valider les règles de comptabilité avec la personne concernée m’a aidé à
transformer un processus papier en parcours concrets pour le terrain et le
bureau. Il s’agit d’un projet client privé ; je peux présenter l’architecture
lors d’un entretien. Le code, les écrans et les données du client restent
confidentiels.
