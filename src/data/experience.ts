import type { Locale } from "../i18n/locales.ts";

/** One text per locale; TypeScript rejects a missing translation. */
type Localized = Record<Locale, string>;

export interface TimelineEntry {
  period: Localized;
  title: Localized;
  /** Where: the country, or the school and its city. */
  place: Localized;
  description: Localized;
}

/** Work and education, in the order the owner wrote them. French is the reference text. */
export const TIMELINE: readonly TimelineEntry[] = [
  {
    period: { en: "2026–Present", pt: "2026–Atual", fr: "2026–Aujourd’hui" },
    title: {
      en: "Independent Software Developer",
      pt: "Desenvolvedor de software independente",
      fr: "Développeur logiciel indépendant",
    },
    place: {
      en: "Switzerland / Europe",
      pt: "Suíça / Europa",
      fr: "Suisse / Europe",
    },
    description: {
      en: "Private engagements in backend and full-stack development. Work on business applications with C#/.NET, ASP.NET Core, React, TypeScript, PostgreSQL, automated testing, Docker and CI/CD.",
      pt: "Projetos privados de desenvolvimento backend e full stack. Trabalho em aplicações de negócio com C#/.NET, ASP.NET Core, React, TypeScript, PostgreSQL, testes automatizados, Docker e CI/CD.",
      fr: "Missions privées en développement backend et full stack. Travail sur des applications métier avec C#/.NET, ASP.NET Core, React, TypeScript, PostgreSQL, tests automatisés, Docker et CI/CD.",
    },
  },
  {
    period: { en: "2023–2025", pt: "2023–2025", fr: "2023–2025" },
    title: {
      en: "Freelance Software Developer",
      pt: "Desenvolvedor de software freelancer",
      fr: "Développeur logiciel freelance",
    },
    place: { en: "Brazil", pt: "Brasil", fr: "Brésil" },
    description: {
      en: "Delivered backend and full-stack solutions for various clients. Requirements analysis, technical design, relational databases, REST APIs, business logic, web interfaces, testing and iterative delivery. This included adapting the frontend of a health-insurance web application in React and TypeScript.",
      pt: "Desenvolvimento de soluções backend e full stack para diversos clientes. Análise de requisitos, concepção técnica, bancos de dados relacionais, APIs REST, lógica de negócio, interfaces web, testes e entregas iterativas. Inclui a adaptação do frontend de uma aplicação web de seguros de saúde em React e TypeScript.",
      fr: "Réalisation de solutions backend et full stack pour différents clients. Analyse des besoins, conception technique, bases de données relationnelles, API REST, logique métier, interfaces web, tests et livraisons itératives. Notamment l’adaptation du frontend d’une application web d’assurance santé en React et TypeScript.",
    },
  },
  {
    period: { en: "2022", pt: "2022", fr: "2022" },
    title: {
      en: "Web Development",
      pt: "Web Development",
      fr: "Web Development",
    },
    place: {
      en: "Le Wagon, Lausanne",
      pt: "Le Wagon, Lausanne",
      fr: "Le Wagon, Lausanne",
    },
    description: {
      en: "10-week intensive web development programme.",
      pt: "Programa intensivo de 10 semanas em desenvolvimento web.",
      fr: "Programme intensif de 10 semaines en développement web.",
    },
  },
  {
    period: { en: "In progress", pt: "Em andamento", fr: "Formation en cours" },
    title: {
      en: "Bachelor’s degree in Software Engineering",
      pt: "Bacharelado em Engenharia de Software",
      fr: "Bachelor en ingénierie logicielle",
    },
    place: {
      en: "Instituto Infnet, Brazil",
      pt: "Instituto Infnet, Brasil",
      fr: "Instituto Infnet, Brésil",
    },
    description: {
      en: "Expected graduation in 2029.",
      pt: "Conclusão prevista para 2029.",
      fr: "Diplôme prévu en 2029.",
    },
  },
];

export interface SkillGroup {
  label: Localized;
  skills: readonly Localized[];
  /**
   * Slugs of the projects where these skills appear, in display order. Each
   * one must be supported by the project's stack or case study.
   */
  projects: readonly string[];
}

/** Proper names read the same in every language. */
function same(name: string): Localized {
  return { en: name, pt: name, fr: name };
}

/** How AI tools are part of the work, without naming a vendor or a product. */
export const AI_ASSISTED_DEVELOPMENT: Localized = {
  en: "AI-assisted development (supervised coding agents)",
  pt: "Desenvolvimento assistido por IA (agentes de programação supervisionados)",
  fr: "Développement assisté par IA (agents de programmation supervisés)",
};

/** Technologies named in the timeline above or in the projects, plus the AI-assisted way of working. */
export const SKILLS: readonly SkillGroup[] = [
  {
    label: same("Backend"),
    skills: [
      same("C#"),
      same(".NET"),
      same("ASP.NET Core"),
      { en: "REST APIs", pt: "APIs REST", fr: "API REST" },
    ],
    projects: [
      "field-operations",
      "facture-qr",
      "property-management",
      "theone",
    ],
  },
  {
    label: same("Frontend"),
    skills: [same("React"), same("TypeScript")],
    projects: ["field-operations"],
  },
  {
    label: { en: "Data", pt: "Dados", fr: "Données" },
    skills: [
      same("PostgreSQL"),
      {
        en: "Relational databases",
        pt: "Bancos de dados relacionais",
        fr: "Bases de données relationnelles",
      },
    ],
    projects: ["field-operations", "facture-qr", "property-management"],
  },
  {
    label: {
      en: "Testing and delivery",
      pt: "Testes e entrega",
      fr: "Tests et livraison",
    },
    skills: [
      {
        en: "Automated testing",
        pt: "Testes automatizados",
        fr: "Tests automatisés",
      },
      same("Docker"),
      same("CI/CD"),
    ],
    projects: [
      "field-operations",
      "facture-qr",
      "property-management",
      "plan-review",
      "theone",
    ],
  },
  {
    label: {
      en: "Automation and tooling",
      pt: "Automação e ferramentas",
      fr: "Automatisation et outillage",
    },
    skills: [same("Python")],
    projects: ["plan-review", "agv-dispatch"],
  },
  {
    label: AI_ASSISTED_DEVELOPMENT,
    skills: [
      { en: "Code review", pt: "Revisão de código", fr: "Revue de code" },
      {
        en: "Automated testing",
        pt: "Testes automatizados",
        fr: "Tests automatisés",
      },
    ],
    projects: [
      "field-operations",
      "facture-qr",
      "property-management",
      "plan-review",
    ],
  },
  {
    label: {
      en: "Games and simulation",
      pt: "Jogos e simulação",
      fr: "Jeux et simulation",
    },
    skills: [same("Unity"), same("FishNet"), same("Blender")],
    projects: ["theone"],
  },
];
