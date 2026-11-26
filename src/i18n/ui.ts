import type { Locale } from "./locales.ts";

const en = {
  "nav.sections": "On this page",
  "a11y.skipLink": "Skip to content",
  "meta.imageAlt": "Roduit Brice, full stack developer",
  "language.label": "Language",
  "theme.dark": "Dark theme",
  "meta.jobTitle": "Full Stack Developer",
  "home.title": "Roduit Brice · Full Stack Developer",
  "home.description":
    "Roduit Brice, full stack developer in Switzerland. I build practical software around real workflows with C#/.NET, React and TypeScript.",
  "home.role": "Full Stack Developer | C#/.NET · React · TypeScript",
  "home.lead":
    "I build practical software around real workflows, from understanding user needs to full-stack implementation, automated testing and client validation.",
  "home.linkedinLink": "LinkedIn profile",
  "home.githubLink": "Code on GitHub",
  "home.projectsLink": "View projects",
  "home.contactLink": "Contact",
  "projects.title": "Selected projects",
  "project.back": "All projects",
  "project.stack": "Technologies",
  "project.confidential":
    "Client project: names, screens and code are confidential. This page shares only non-confidential project information.",
  "project.facts": "Facts",
  "project.type": "Type",
  "project.context": "Context",
  "project.clientWork": "Client work, confidential",
  "project.private":
    "Private project: code and screens are not public. This page shares only general information about the project.",
  "project.privateWork": "Private project, code not public",
  "project.next": "Next project",
  "project.architecture": "Architecture",
  "project.figure": "Figure",
  "project.illustration":
    "An illustration for this site, not the project code.",
  "project.media": "Screenshots",
  "about.title": "About",
  "about.body":
    "Software developer based in Switzerland, working professionally as a freelancer since 2023. I build backend and full-stack applications in C#/.NET, React and TypeScript, with a particular interest in software architecture, automation, testing and business software. I use AI tools to move faster without giving up control: I design the architecture, review every change and only ship what is tested.",
  "about.availability":
    "I am open to software developer positions in Switzerland and to freelance projects.",
  "experience.title": "Experience and education",
  "skills.title": "Technologies",
  "contact.title": "Contact",
  "contact.body": "You can reach me on LinkedIn or find my code on GitHub.",
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
  "nav.sections": "Nesta página",
  "a11y.skipLink": "Pular para o conteúdo",
  "meta.imageAlt": "Roduit Brice, desenvolvedor full stack",
  "language.label": "Idioma",
  "theme.dark": "Tema escuro",
  "meta.jobTitle": "Desenvolvedor full stack",
  "home.title": "Roduit Brice · Desenvolvedor full stack",
  "home.description":
    "Roduit Brice, desenvolvedor full stack na Suíça. Desenvolvo software para fluxos de trabalho reais com C#/.NET, React e TypeScript.",
  "home.role": "Desenvolvedor full stack | C#/.NET · React · TypeScript",
  "home.lead":
    "Desenvolvo software para fluxos de trabalho reais: entendo as necessidades, implemento a solução full stack, testo e valido com quem a usa.",
  "home.linkedinLink": "Perfil no LinkedIn",
  "home.githubLink": "Código no GitHub",
  "home.projectsLink": "Ver projetos",
  "home.contactLink": "Contato",
  "projects.title": "Projetos selecionados",
  "project.back": "Todos os projetos",
  "project.stack": "Tecnologias",
  "project.confidential":
    "Projeto de cliente: nomes, telas e código são confidenciais. Esta página apresenta apenas informações não confidenciais.",
  "project.facts": "Ficha de fatos",
  "project.type": "Tipo",
  "project.context": "Contexto",
  "project.clientWork": "Projeto de cliente, confidencial",
  "project.private":
    "Projeto privado: o código e as telas não são públicos. Esta página apresenta apenas informações gerais sobre o projeto.",
  "project.privateWork": "Projeto privado, código não público",
  "project.next": "Próximo projeto",
  "project.architecture": "Arquitetura",
  "project.figure": "Figura",
  "project.illustration":
    "Uma ilustração para este site, não o código do projeto.",
  "project.media": "Capturas de tela",
  "about.title": "Sobre",
  "about.body":
    "Desenvolvedor de software baseado na Suíça, com experiência profissional como freelancer desde 2023. Desenvolvo aplicações backend e full stack em C#/.NET, React e TypeScript, com interesse particular em arquitetura de software, automação, testes e sistemas de negócio. Uso ferramentas de IA para ganhar velocidade, sem abrir mão do controle: eu defino a arquitetura, reviso cada mudança e só entrego o que está testado.",
  "about.availability":
    "Estou aberto a vagas de desenvolvedor de software na Suíça e a projetos freelance.",
  "experience.title": "Trajetória",
  "skills.title": "Tecnologias",
  "contact.title": "Contato",
  "contact.body":
    "Você pode falar comigo pelo LinkedIn ou ver meu código no GitHub.",
  "notFound.pageTitle": "Página não encontrada",
  "notFound.description": "Esta página não existe.",
  "notFound.title": "Página não encontrada",
  "notFound.body": "A página que você procura não existe ou mudou de endereço.",
  "notFound.back": "Voltar para a página inicial",
};

const fr: Dictionary = {
  "nav.sections": "Sur cette page",
  "a11y.skipLink": "Aller au contenu",
  "meta.imageAlt": "Roduit Brice, développeur full stack",
  "language.label": "Langue",
  "theme.dark": "Thème sombre",
  "meta.jobTitle": "Développeur full stack",
  "home.title": "Roduit Brice · Développeur full stack",
  "home.description":
    "Roduit Brice, développeur full stack en Suisse. Je conçois des logiciels adaptés à des processus de travail réels avec C#/.NET, React et TypeScript.",
  "home.role": "Développeur full stack | C#/.NET · React · TypeScript",
  "home.lead":
    "Je construis des logiciels adaptés à des processus de travail réels : comprendre les besoins, concevoir et développer la solution, la tester, puis la valider avec les utilisateurs.",
  "home.linkedinLink": "Profil LinkedIn",
  "home.githubLink": "Code sur GitHub",
  "home.projectsLink": "Voir les projets",
  "home.contactLink": "Contact",
  "projects.title": "Projets choisis",
  "project.back": "Tous les projets",
  "project.stack": "Technologies",
  "project.confidential":
    "Projet client\u00a0: les noms, les écrans et le code sont confidentiels. Cette page présente uniquement des informations non confidentielles.",
  "project.facts": "Fiche technique",
  "project.type": "Type",
  "project.context": "Contexte",
  "project.clientWork": "Projet client, confidentiel",
  "project.private":
    "Projet privé : le code et les écrans ne sont pas publics. Cette page ne présente que des informations générales sur le projet.",
  "project.privateWork": "Projet privé, code non public",
  "project.next": "Projet suivant",
  "project.architecture": "Architecture",
  "project.figure": "Figure",
  "project.illustration":
    "Une illustration pour ce site, pas le code du projet.",
  "project.media": "Captures d’écran",
  "about.title": "À propos",
  "about.body":
    "Développeur logiciel basé en Suisse, avec une expérience professionnelle freelance depuis 2023. Je conçois des applications backend et full stack en C#/.NET, React et TypeScript, avec un intérêt particulier pour l’architecture logicielle, l’automatisation, les tests et les systèmes métier. J'utilise des outils d'IA pour aller plus vite, sans perdre le contrôle : je conçois l'architecture, je relis chaque changement et je ne livre que ce qui est testé.",
  "about.availability":
    "Je suis ouvert à un poste de développeur logiciel en Suisse ainsi qu’à des missions freelance.",
  "experience.title": "Parcours",
  "skills.title": "Technologies",
  "contact.title": "Contact",
  "contact.body":
    "Vous pouvez me contacter sur LinkedIn ou voir mon code sur GitHub.",
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
