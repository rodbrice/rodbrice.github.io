---
title: Système de gestion des opérations de chantier
kind: Application terrain et bureau
summary: Les chefs d’équipe consignaient le travail quotidien sur papier, puis le bureau le ressaisissait dans des tableurs. J’ai conçu et développé une saisie sur tablette utilisable hors ligne, reliée au contrôle au bureau.
problem: "Les chefs d’équipe consignaient le travail sur papier ; le bureau le ressaisissait dans des tableurs."
contribution: "J’ai conçu et développé la saisie sur tablette hors ligne, le backend et l’application de bureau."
status: clientValidation
order: 1
featured: true
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

J’ai travaillé directement avec le comptable du client, la personne chargée de
la comptabilité au bureau. Les règles ont été fixées par séries de questions et
de réponses écrites, et chaque réponse est devenue une décision consignée.
Avant de réaliser un écran, j’en faisais relire et valider le prototype
interactif. Quand le client demandait des changements, je transformais chaque
demande en un plan de petites livraisons, chacune testée séparément. J’ai conçu
et développé le parcours tablette, le backend et l’application de bureau.
Pendant le développement, j’ai utilisé des agents de programmation sous ma
supervision, avec revue du code et tests automatisés.

## Du terrain au bureau

- **Sur le terrain :** les chefs d’équipe peuvent saisir les équipes, les
  heures, les temps d’attente, les informations de sécurité et les signatures
  sur tablette. L’interface tient compte du port de gants et la saisie fonctionne
  sans connexion.
- **La file de travail du bureau :** une file guidée mène chaque rapport, étape
  par étape, jusqu’à sa comptabilisation. Les valeurs saisies par le chef
  d’équipe sont contrôlées par rapport aux registres, puis associées, ajoutées
  ou corrigées ; le rapport est ensuite contrôlé et comptabilisé sur les postes
  de la commande du client, avec un bordereau de prix dont les articles portent
  un coefficient.
- **Périodes clôturées :** le mois se clôt sur une liste de contrôle ; modifier
  la comptabilité d’un mois clôturé, ou comptabiliser sur un poste de commande
  clôturé, demande un motif.
- **Feuilles de métrés :** chacune porte sur un seul poste de commande et
  possède des versions. Une feuille est régénérée tant qu’elle attend sa saisie
  dans SAP, et corrigée par une nouvelle version une fois enregistrée dans SAP.
- **Grand livre des commandes :** soldes par poste de commande, avis à
  l’approche de la valeur de la commande, alerte de coût non couvert qui ne
  bloque jamais, et rapprochement avec l’export SAP.
- **Autour de cette routine :** le journal de chantier quotidien du client, les
  présences avec leurs règles horaires, les registres, et les exports PDF et
  Excel.
- **Traçabilité :** chaque correction faite au bureau enregistre son auteur, sa
  date, l’ancienne et la nouvelle valeur, et le motif. À la demande du client,
  les cas simples, comme un premier enregistrement, ne demandent plus de motif ;
  le système inscrit le sien.

## Choix techniques

- **Le serveur, seule source des règles.** Les écrans du bureau affichent ce
  que répond l’API, comme les alertes de budget et la couverture des coûts, sans
  jamais le recalculer ; chaque règle n’existe qu’à un endroit.
- **Un papier signé reste exact.** Quand une correction modifie le contenu d’un
  papier que le client a déjà signé, la signature du client tombe et le système
  demande d’imprimer la nouvelle édition pour la faire signer à nouveau.
- **File hors ligne sur la tablette.** Les rapports attendent dans une file sur
  l’appareil et se synchronisent avec le serveur au retour de la connexion.
- **Documents en italien, données non traduites.** Chaque utilisateur choisit
  l’italien ou l’anglais pour l’interface, mais les documents et les exports
  restent toujours en italien, et les données enregistrées ne sont jamais
  traduites.

## Qualité et état actuel

Le travail a été livré en plus de 230 pull requests depuis septembre 2026,
chacune validée par les tests automatisés : plus de 900 tests d’intégration,
plus de 2 300 tests du frontend et plus de 110 tests de bout en bout, avec plus
de 65 décisions d’architecture documentées (27 novembre 2026). Le client teste
actuellement le système dans sa phase finale de validation. Le déploiement en
production et l’impact opérationnel ne sont pas établis.

## Ce que j’ai appris et éléments vérifiables

Valider les règles de comptabilité avec la personne concernée, une question et
un prototype à la fois, m’a aidé à transformer un processus papier en parcours
concrets pour le terrain et le bureau. Il s’agit d’un projet client privé ; je
peux présenter l’architecture lors d’un entretien. Le code, les écrans et les
données du client restent confidentiels.
