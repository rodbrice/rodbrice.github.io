import type { Locale } from "./locales.ts";

const en = {
  "a11y.skipLink": "Skip to content",
  "meta.imageAlt": "Roduit Brice, software developer",
  "language.label": "Language",
  "theme.dark": "Dark theme",
  "home.description":
    "Software engineer building backends, field service systems and multiplayer games.",
  "home.eyebrow": "Software engineer",
  "home.lead":
    "Backends, field service systems and multiplayer games. The full portfolio is on its way.",
  "home.githubLink": "See my code on GitHub",
  "notFound.pageTitle": "Page not found",
  "notFound.description": "This page does not exist.",
  "notFound.title": "Page not found",
  "notFound.body": "The page you are looking for does not exist or has moved.",
  "notFound.back": "Back to the home page",
} as const;

export type UiKey = keyof typeof en;

/** Every locale must define exactly the English keys; TypeScript rejects missing or extra ones. */
type Dictionary = Record<UiKey, string>;

const pt: Dictionary = {
  "a11y.skipLink": "Pular para o conteúdo",
  "meta.imageAlt": "Roduit Brice, desenvolvedor de software",
  "language.label": "Idioma",
  "theme.dark": "Tema escuro",
  "home.description":
    "Engenheiro de software que desenvolve backends, sistemas de serviço de campo e jogos multiplayer.",
  "home.eyebrow": "Engenheiro de software",
  "home.lead":
    "Backends, sistemas de serviço de campo e jogos multiplayer. O portfólio completo está a caminho.",
  "home.githubLink": "Veja meu código no GitHub",
  "notFound.pageTitle": "Página não encontrada",
  "notFound.description": "Esta página não existe.",
  "notFound.title": "Página não encontrada",
  "notFound.body": "A página que você procura não existe ou mudou de endereço.",
  "notFound.back": "Voltar para a página inicial",
};

const fr: Dictionary = {
  "a11y.skipLink": "Aller au contenu",
  "meta.imageAlt": "Roduit Brice, développeur logiciel",
  "language.label": "Langue",
  "theme.dark": "Thème sombre",
  "home.description":
    "Ingénieur logiciel qui conçoit des backends, des systèmes d’intervention sur le terrain et des jeux multijoueurs.",
  "home.eyebrow": "Ingénieur logiciel",
  "home.lead":
    "Backends, systèmes d’intervention sur le terrain et jeux multijoueurs. Le portfolio complet arrive bientôt.",
  "home.githubLink": "Voir mon code sur GitHub",
  "notFound.pageTitle": "Page introuvable",
  "notFound.description": "Cette page n’existe pas.",
  "notFound.title": "Page introuvable",
  "notFound.body": "La page que vous cherchez n’existe pas ou a été déplacée.",
  "notFound.back": "Retour à l’accueil",
};

export const ui: Record<Locale, Dictionary> = { en, pt, fr };

export function useTranslations(locale: Locale): (key: UiKey) => string {
  return (key) => ui[locale][key];
}
