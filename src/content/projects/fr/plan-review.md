---
title: plan-review — risques des changements Terraform
kind: Dépôt public · Développement initial
summary: Un changement d’infrastructure risqué peut passer inaperçu dans un long plan Terraform. plan-review est un outil en ligne de commande Python, à un stade initial, qui lit un plan enregistré et signale ce que ce changement détruit, remplace ou ouvre.
order: 4
stack: [Python, Terraform, pytest]
---

## Le problème

Un long `terraform plan` noie les quelques lignes importantes — une base de
données à remplacer, une politique IAM qui gagne un joker — parmi des centaines
de changements d’attributs sans conséquence. Les scanners statiques vérifient
si la configuration finale est mal paramétrée. Ils ne disent pas ce que ce
changement précis détruit, remplace ou élargit par rapport à ce qui tourne
aujourd’hui.

## Mon rôle

C’est mon propre projet public. J’ai choisi le périmètre, défini les règles et
leurs limites, et vérifié chaque jalon sur de vraies sorties Terraform avant de
l’intégrer. J’ai travaillé avec des agents de programmation sous ma supervision
et une étape de revue automatisée ; mon rôle a été la conception, la relecture
de chaque changement et la validation.

## La solution

L’outil lit le JSON que `terraform show -json` produit pour un plan enregistré
et applique cinq règles :

- **R1 et R2 :** une ressource qui contient des données, comme une base de
  données ou un bucket, est détruite ou remplacée.
- **R3 :** une politique IAM gagne une action ou une ressource avec un joker.
- **R4 :** une règle d’entrée ouvre un port à tout Internet.
- **R5 :** un bucket perd sa protection d’accès public ou devient public.

Le rapport est en texte, Markdown ou JSON. Un fichier `.plan-review.yml` permet
d’ignorer une règle ou de changer sa sévérité, et le code de sortie indique à
un pipeline si un constat bloquant a été trouvé.

## Choix techniques

- **Examiner le delta, pas la configuration.** Le plan est le seul artefact qui
  porte à la fois la valeur actuelle et la valeur prévue de chaque ressource.
  L’outil n’exécute donc jamais Terraform et n’a besoin d’aucun identifiant
  cloud ; une mauvaise configuration que le plan ne touche pas reste hors
  périmètre.
- **Explicite plutôt qu’heuristique.** Les types de ressources considérés comme
  contenant des données forment une liste explicite et documentée. Chaque règle
  est une fonction pure d’un changement de ressource vers des constats, testée
  avec des cas positifs et négatifs.
- **De vrais plans comme données de test.** Les plans d’exemple sont de vraies
  sorties Terraform, générées hors ligne à partir de configurations minimales
  avec des identifiants factices. L’intégration continue les régénère et échoue
  s’ils s’écartent de leurs sources.
- **Rien de sensible dans les rapports.** Les constats ne citent que ce dont un
  relecteur a besoin, jamais une valeur que Terraform marque comme sensible.

## Qualité et validation

L’intégration continue exécute le formatage et le lint (ruff), la vérification
des types (mypy) et la suite pytest sur Python 3.12 et 3.13. Chaque jalon a un
procès-verbal de validation avec les commandes exécutées et les résultats
observés.

## État actuel et limites

Développement initial. L’outil en ligne de commande avec les règles R1 à R5, le
fichier de configuration et les trois formats de rapport sont terminés. Une
GitHub Action qui commente les pull requests et une première version publiée
sont le prochain jalon ; ni l’une ni l’autre n’existe encore. Les règles
ciblent uniquement des types de ressources AWS. Ce n’est ni un remplaçant de
Checkov, Trivy ou tfsec, ni un moteur de politiques, ni un estimateur de coûts.

## Ce que j’ai appris

Écrire ce que l’outil n’est pas a été aussi utile qu’écrire ses règles : cela a
gardé le périmètre assez petit pour tester chaque règle sur de vrais plans.

## Éléments vérifiables

- [Code source et README](https://github.com/rodbrice/plan-review)
- [Décision d’architecture](https://github.com/rodbrice/plan-review/blob/main/docs/adr/0001-review-the-plan-delta-not-the-state.md)
- [Procès-verbaux de validation](https://github.com/rodbrice/plan-review/tree/main/docs/validation)
- [Plans d’exemple fictifs](https://github.com/rodbrice/plan-review/tree/main/fixtures)
