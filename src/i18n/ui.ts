import type { Locale } from "./locales.ts";

const en = {
  "a11y.skipLink": "Skip to content",
  "meta.imageAlt": "Roduit Brice, software developer",
  "language.label": "Language",
  "theme.dark": "Dark theme",
  "meta.jobTitle": "Software Developer",
  "home.title": "Roduit Brice · Software Developer",
  "home.description":
    "Roduit Brice, software developer based in Switzerland: backend and full-stack applications in C#/.NET, React and TypeScript.",
  "home.role": "Software Developer — C#/.NET, React & TypeScript",
  "home.lead":
    "I build business applications end to end: APIs and data models in .NET, interfaces in React, with automated tests throughout.",
  "home.linkedinLink": "LinkedIn profile",
  "home.githubLink": "Code on GitHub",
  "home.projectsLink": "View projects",
  "projects.title": "Selected projects",
  "project.back": "All projects",
  "project.stack": "Technologies",
  "project.confidential":
    "Client project: names, screens and code are confidential. This page describes the problem, the architecture and the technical decisions.",
  "project.media": "Screenshots",
  "about.title": "About",
  "about.body":
    "Software developer based in Switzerland, working professionally as a freelancer since 2023. I build backend and full-stack applications in C#/.NET, React and TypeScript, with a particular interest in software architecture, automation, testing and business software.",
  "about.availability":
    "I am open to software developer positions in Switzerland and to freelance projects.",
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
  "meta.jobTitle": "Desenvolvedor de software",
  "home.title": "Roduit Brice · Desenvolvedor de software",
  "home.description":
    "Roduit Brice, desenvolvedor de software baseado na Suíça: aplicações backend e full stack em C#/.NET, React e TypeScript.",
  "home.role": "Desenvolvedor de software — C#/.NET, React & TypeScript",
  "home.lead":
    "Desenvolvo aplicações de negócio de ponta a ponta: APIs e modelos de dados em .NET, interfaces em React, com testes automatizados em cada etapa.",
  "home.linkedinLink": "Perfil no LinkedIn",
  "home.githubLink": "Código no GitHub",
  "home.projectsLink": "Ver projetos",
  "projects.title": "Projetos selecionados",
  "project.back": "Todos os projetos",
  "project.stack": "Tecnologias",
  "project.confidential":
    "Projeto de cliente: nomes, telas e código são confidenciais. Esta página descreve o problema, a arquitetura e as decisões técnicas.",
  "project.media": "Capturas de tela",
  "about.title": "Sobre",
  "about.body":
    "Desenvolvedor de software baseado na Suíça, com experiência profissional como freelancer desde 2023. Desenvolvo aplicações backend e full stack em C#/.NET, React e TypeScript, com interesse particular em arquitetura de software, automação, testes e sistemas de negócio.",
  "about.availability":
    "Estou aberto a vagas de desenvolvedor de software na Suíça e a projetos freelance.",
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
  "meta.jobTitle": "Développeur logiciel",
  "home.title": "Roduit Brice · Développeur logiciel",
  "home.description":
    "Roduit Brice, développeur logiciel basé en Suisse\u00a0: applications backend et full stack en C#/.NET, React et TypeScript.",
  "home.role": "Développeur logiciel — C#/.NET, React & TypeScript",
  "home.lead":
    "Je développe des applications métier de bout en bout\u00a0: API et modèles de données en .NET, interfaces en React, avec des tests automatisés à chaque étape.",
  "home.linkedinLink": "Profil LinkedIn",
  "home.githubLink": "Code sur GitHub",
  "home.projectsLink": "Voir les projets",
  "projects.title": "Projets choisis",
  "project.back": "Tous les projets",
  "project.stack": "Technologies",
  "project.confidential":
    "Projet client\u00a0: les noms, les écrans et le code sont confidentiels. Cette page décrit le problème, l’architecture et les décisions techniques.",
  "project.media": "Captures d’écran",
  "about.title": "À propos",
  "about.body":
    "Développeur logiciel basé en Suisse, avec une expérience professionnelle freelance depuis 2023. Je conçois des applications backend et full stack en C#/.NET, React et TypeScript, avec un intérêt particulier pour l’architecture logicielle, l’automatisation, les tests et les systèmes métier.",
  "about.availability":
    "Je suis ouvert à un poste de développeur logiciel en Suisse ainsi qu’à des missions freelance.",
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
