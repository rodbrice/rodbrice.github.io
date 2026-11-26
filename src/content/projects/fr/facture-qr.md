---
title: Facture QR — facturation avec QR-facture suisse
kind: Noyau de facturation QR-facture
summary: Une QR-facture suisse doit respecter des règles strictes d’adresse, de référence et d’IBAN. Je construis par petites étapes vérifiées un noyau de facturation .NET — bibliothèque QR-facture, stockage PostgreSQL, API HTTP locale — et je publie les contrôles de chaque étape.
problem: "Une QR-facture suisse doit respecter des règles strictes d’adresse, de référence et d’IBAN."
contribution: "J’ai fixé le périmètre, pris les décisions de conception et vérifié chaque étape par rapport à la norme."
status: inDevelopment
order: 2
stack: [C#, .NET, ASP.NET Core, PostgreSQL, EF Core]
source: https://github.com/rodbrice/facture-qr
---

## Le problème

Depuis septembre 2022, la QR-facture est le seul bulletin de versement accepté
en Suisse et au Liechtenstein. La produire correctement suppose de respecter
les Implementation Guidelines de SIX : adresses structurées, QR-IBAN avec
référence QR ou IBAN avec référence de créancier, contenu exact du Swiss QR
Code et mise en page fixe. Une section paiement qui enfreint ces règles peut
être refusée par les banques. Facture QR est un petit outil de facturation pour
indépendants qui règle d’abord ce noyau, avant toute interface.

## Mon rôle

C’est mon propre projet public. J’ai fixé le périmètre et ce qui en est exclu,
pris les décisions de conception consignées dans les ADR et vérifié chaque
étape par rapport à la norme avant de l’intégrer. J’ai travaillé avec des
agents de programmation sous ma supervision et une étape de revue automatisée ;
mon rôle a été de définir les règles, de relire les changements et de vérifier
les résultats.

## Démarche et contraintes

Le dépôt avance par petites unités, chacune avec un procès-verbal de
validation : d’abord la bibliothèque QR-facture, puis le modèle de facture et
son stockage, puis une API HTTP. Le périmètre est volontairement étroit : CHF
uniquement, pas de TVA, et seulement des données fictives tirées des exemples
des directives SIX.

## Ce qui existe aujourd’hui

- **Bibliothèque QR-facture :** contrôle des IBAN et QR-IBAN suisses, adresses
  structurées, référence QR et référence de créancier, rendu de la section
  paiement en PDF ou PNG.
- **Modèle de facture :** une facture passe de brouillon à émise puis payée, et
  seul un brouillon peut changer. Le total est toujours la somme des lignes et
  reste dans les limites de montant de la QR-facture.
- **Stockage :** PostgreSQL avec EF Core ; le schéma ne change que par des
  migrations.
- **API HTTP locale :** clients, brouillons et leurs lignes, émission,
  enregistrement du paiement et facture A4 en PDF avec sa QR-facture. Les
  erreurs suivent le format ProblemDetails et le document OpenAPI est versionné.

## Choix techniques

- **Des numéros sans doublon ni trou.** Chaque année a une ligne de compteur,
  incrémentée et verrouillée dans la transaction qui émet la facture. Deux
  factures émises au même moment n’obtiennent jamais le même numéro, et une
  émission qui échoue annule l’incrément. J’ai écarté `MAX + 1` (doublons en
  concurrence), une séquence de base de données (trous après une annulation) et
  les transactions sérialisables avec reprises (une boucle de reprise sur chaque
  chemin d’émission). En contrepartie, les émissions d’une même année
  s’attendent le temps d’une courte transaction.
- **Les règles dans le domaine, répétées là où les données pourraient se
  corrompre.** Les règles de facture vivent dans des classes C# simples ; la
  base de données répète les plus critiques avec des contraintes de contrôle et
  un index unique sur le numéro.
- **Une bibliothèque éprouvée pour la mise en page.** Le rendu de la section
  paiement passe par une bibliothèque open source derrière une seule classe :
  le projet se concentre sur la validation plutôt que sur le dessin d’une mise
  en page réglementée.

## Qualité et validation

- Les contenus QR sont comparés à des contenus attendus écrits à la main
  d’après la norme, décodés en retour et lus par un décodeur QR indépendant.
- Les tests de l’API relisent le code QR dans le PDF généré avec un autre
  décodeur et le comparent à la facture.
- Un test de concurrence émet 40 brouillons en même temps sur une vraie base
  PostgreSQL et vérifie que les numéros vont exactement de 1 à 40. Remplacer
  l’allocation par un `MAX + 1` naïf a fait échouer ce test, comme le consignent
  les notes de validation.
- L’intégration continue compile avec les avertissements traités comme des
  erreurs, vérifie le formatage, exécute les tests et applique les migrations
  sur une base vide.

## État actuel et limites

En développement. La validation des exemples sur le portail SIX est encore en
attente. Il n’y a pas encore d’interface, et l’API n’a pas d’authentification :
elle est prévue pour un usage local par une seule personne. Ce n’est pas un
service de facturation hébergé. Une interface React et le rapprochement des
relevés bancaires sont des étapes prévues, pas des fonctionnalités.

## Ce que j’ai appris

Travailler à partir d’une norme réglementée m’a poussé à écrire les preuves
avant les fonctionnalités. Consigner chaque contrôle avec sa commande et son
résultat montre aussi clairement ce qui est vérifié et ce qui reste en attente.

## Éléments vérifiables

- [Code source et README](https://github.com/rodbrice/facture-qr)
- [Décisions d’architecture (ADR)](https://github.com/rodbrice/facture-qr/tree/main/docs/adr)
- [Procès-verbaux de validation](https://github.com/rodbrice/facture-qr/tree/main/docs/validation)
- [Exemples fictifs](https://github.com/rodbrice/facture-qr/tree/main/docs/samples)
