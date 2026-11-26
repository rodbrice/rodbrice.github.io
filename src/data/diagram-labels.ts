import type { Locale } from "../i18n/locales";

/** Diagram labels approved with the Laboratory design. */
export const diagramLabels = {
  en: {
    inner: "Domain",
    app: "Application",
    infra: "Infrastructure · API",
    files: "file storage",
    jobs: "periodic jobs",
    auth: "authentication · authorisation",
    archTests: "unit · integration · architecture tests",
    inward: "dependencies point inward",
    client: "Client",
    server: "Dedicated server",
    predicts: "predicts, then reconciles",
    validates: "owns the state, validates every action",
    input: "input",
    state: "state",
    modules: "one assembly per domain, each with its tests",
    combat: "Combat",
    body: "Body",
    items: "Items",
    ai: "AI",
  },
  pt: {
    inner: "Domínio",
    app: "Aplicação",
    infra: "Infraestrutura · API",
    files: "armazenamento de arquivos",
    jobs: "jobs periódicos",
    auth: "autenticação · autorização",
    archTests: "testes unitários · integração · arquitetura",
    inward: "dependências apontam para dentro",
    client: "Cliente",
    server: "Servidor dedicado",
    predicts: "prevê, depois reconcilia",
    validates: "é dono do estado, valida cada ação",
    input: "entrada",
    state: "estado",
    modules: "um assembly por domínio, cada um com seus testes",
    combat: "Combate",
    body: "Corpo",
    items: "Itens",
    ai: "IA",
  },
  fr: {
    inner: "Domaine",
    app: "Application",
    infra: "Infrastructure · API",
    files: "stockage de fichiers",
    jobs: "tâches périodiques",
    auth: "authentification · autorisation",
    archTests: "tests unitaires · intégration · architecture",
    inward: "les dépendances pointent vers l’intérieur",
    client: "Client",
    server: "Serveur dédié",
    predicts: "prédit, puis réconcilie",
    validates: "détient l’état, valide chaque action",
    input: "entrée",
    state: "état",
    modules: "une assembly par domaine, chacune avec ses tests",
    combat: "Combat",
    body: "Corps",
    items: "Objets",
    ai: "IA",
  },
} satisfies Record<Locale, Record<string, string>>;

/**
 * The field-to-office flow, drawn from scratch with synthetic labels only:
 * no client name, real value, form layout or screen.
 */
export const flowLabels = {
  en: {
    field: "In the field",
    office: "In the office",
    steps: [
      { title: "Tablet", detail: "field report, captured offline" },
      { title: "Sync", detail: "reports reach the office application" },
      { title: "Office review queue", detail: "reports wait for review" },
      { title: "Validation", detail: "checked before any document is made" },
    ],
    outputs: "Outputs",
    formats: ["PDF", "Excel", "SAP-ready blocks"],
  },
  pt: {
    field: "Em campo",
    office: "No escritório",
    steps: [
      { title: "Tablet", detail: "relatório de campo, registrado offline" },
      {
        title: "Sincronização",
        detail: "os relatórios chegam à aplicação do escritório",
      },
      {
        title: "Fila de revisão no escritório",
        detail: "os relatórios aguardam revisão",
      },
      { title: "Validação", detail: "conferidos antes de gerar documentos" },
    ],
    outputs: "Saídas",
    formats: ["PDF", "Excel", "Blocos prontos para o SAP"],
  },
  fr: {
    field: "Sur le terrain",
    office: "Au bureau",
    steps: [
      { title: "Tablette", detail: "rapport de terrain, saisi hors ligne" },
      {
        title: "Synchronisation",
        detail: "les rapports rejoignent l’application de bureau",
      },
      {
        title: "File de contrôle au bureau",
        detail: "les rapports attendent leur contrôle",
      },
      {
        title: "Validation",
        detail: "vérifiés avant de produire les documents",
      },
    ],
    outputs: "Sorties",
    formats: ["PDF", "Excel", "Blocs prêts pour SAP"],
  },
} satisfies Record<
  Locale,
  {
    field: string;
    office: string;
    steps: { title: string; detail: string }[];
    outputs: string;
    formats: string[];
  }
>;
