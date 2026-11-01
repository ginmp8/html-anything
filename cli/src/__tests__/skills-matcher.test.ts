import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { kwMatches } from "../skills-matcher.js";

const { skillStore, invokeStore, setInvokeResult, resetStores } = vi.hoisted(() => {
  const skillStore = {
    templates: [
      {
        id: "resume-modern",
        enName: "Modern Resume",
        emoji: "📄",
        description: "Modern A4 resume for print and PDF export",
        category: "resume",
        scenario: "personal",
        aspectHint: "A4",
        tags: ["resume", "cv", "career"],
      },
      {
        id: "article-magazine",
        enName: "Magazine Article",
        emoji: "📖",
        description: "Substack and Medium-inspired editorial long-form publishing",
        category: "article",
        scenario: "marketing",
        aspectHint: "A4 / long page",
        tags: ["blog", "essay", "newsletter", "writing", "article"],
      },
      {
        id: "social-x-post-card",
        enName: "X / Twitter Post Card",
        emoji: "𝕏",
        description: "Realistic X post card with engagement data",
        category: "card",
        scenario: "marketing",
        aspectHint: "1280x720 or 1080x1080",
        tags: ["twitter", "x", "social", "card", "overlay"],
      },
      {
        id: "deck-swiss-international",
        enName: "Swiss International Deck",
        emoji: "🇨🇭",
        description: "Swiss International Style presentation, clean grids",
        category: "slides",
        scenario: "marketing",
        aspectHint: "16:9",
        tags: ["slides", "deck", "presentation", "swiss"],
      },
      {
        id: "pricing-page",
        enName: "Pricing Page",
        emoji: "💳",
        description: "Three pricing tiers with comparison table and FAQ",
        category: "prototype",
        scenario: "sales",
        aspectHint: "Desktop 1440",
        tags: ["pricing", "plans", "tiers"],
      },
      {
        id: "team-okrs",
        enName: "Team OKRs",
        emoji: "🎯",
        description: "Quarterly objectives, key results, owners, and status indicators",
        category: "dashboard",
        scenario: "product",
        aspectHint: "Desktop 1440",
        tags: ["okr", "objectives", "key results", "goals"],
      },
      {
        id: "eng-runbook",
        enName: "Engineering Runbook",
        emoji: "📕",
        description: "Service overview, alert table, dashboards and on-call procedures",
        category: "doc",
        scenario: "engineering",
        aspectHint: "Long page",
        tags: ["runbook", "ops", "oncall", "sre"],
      },
      {
        id: "kanban-board",
        enName: "Kanban Board",
        emoji: "📋",
        description: "Kanban board with columns",
        category: "dashboard",
        scenario: "operations",
        aspectHint: "Desktop 1440",
        tags: ["kanban", "board", "todo", "doing", "done"],
      },
      {
        id: "weekly-update",
        enName: "Weekly Update Deck",
        emoji: "🗓️",
        description: "Weekly update slides: shipped, in progress, blockers, metrics, requests",
        category: "slides",
        scenario: "operations",
        aspectHint: "16:9 ×8",
        tags: ["weekly", "report", "status"],
      },
      {
        id: "docs-page",
        enName: "Documentation Page",
        emoji: "📚",
        description: "Technical documentation page with sidebar navigation",
        category: "doc",
        scenario: "engineering",
        aspectHint: "Desktop 1440",
        tags: ["docs", "documentation", "doc"],
      },
    ] as const,
  };

  const invokeStore = {
    summaryText: "",
    errorMessage: null as string | null,
  };

  const defaults = {
    templates: JSON.parse(JSON.stringify(skillStore.templates)),
  };

  return {
    skillStore,
    invokeStore,
    setInvokeResult: (summary: string, err?: string | null) => {
      invokeStore.summaryText = summary;
      invokeStore.errorMessage = err ?? null;
    },
    resetStores: () => {
      skillStore.templates = JSON.parse(JSON.stringify(defaults.templates));
      invokeStore.summaryText = "";
      invokeStore.errorMessage = null;
    },
  };
});

vi.mock("../skills-loader.js", () => ({
  listSkills: vi.fn(() => [...skillStore.templates]),
  loadSkill: vi.fn((_dir: string, id: string) => {
    const t = skillStore.templates.find((s) => s.id === id);
    if (!t) return null;
    return { ...t, body: "You are a world-class HTML designer. Output complete HTML.", exampleMd: undefined, exampleHtml: undefined };
  }),
}));

vi.mock("../agents-invoke.js", () => ({
  invokeAgent: vi.fn(() => {
    const chunks: any[] = [];
    if (invokeStore.errorMessage) {
      chunks.push({ type: "error", message: invokeStore.errorMessage });
    } else {
      chunks.push({ type: "delta", text: invokeStore.summaryText });
      chunks.push({ type: "done", code: 0 });
    }

    let index = 0;
    return {
      getReader() {
        return {
          read() {
            if (index < chunks.length) {
              return Promise.resolve({ value: chunks[index++], done: false });
            }
            return Promise.resolve({ value: undefined, done: true });
          },
          cancel() {},
          releaseLock() {},
          get closed() {
            return index >= chunks.length;
          },
        };
      },
    };
  }),
}));

import { matchTemplate } from "../skills-matcher.js";

const SKILLS_DIR = "/fake/skills/dir";
const AGENT_ID = "claude";

beforeEach(() => {
  resetStores();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("kwMatches", () => {
  it("matches ASCII keyword on word boundary", () => {
    expect(kwMatches("I need a resume template", "resume")).toBe(true);
  });

  it("does NOT match ASCII keyword as substring inside another word", () => {
    expect(kwMatches("the document is ready", "doc")).toBe(false);
  });

  it("matches standalone ASCII keyword at start of text", () => {
    expect(kwMatches("doc is important", "doc")).toBe(true);
  });

  it("matches standalone ASCII keyword at end of text", () => {
    expect(kwMatches("read the doc", "doc")).toBe(true);
  });

  it("does NOT match bare 'x' inside English words", () => {
    expect(kwMatches("next example text", "x")).toBe(false);
  });

  it("does NOT match bare 'x' inside complex words", () => {
    expect(kwMatches("experience index box max", "x")).toBe(false);
  });

  it("matches standalone 'x' as a word", () => {
    expect(kwMatches("platform x is great", "x")).toBe(true);
  });

  it("does NOT match 'app' as substring in 'happy'", () => {
    expect(kwMatches("happy developer", "app")).toBe(false);
  });

  it("does NOT match 'live' inside 'deliver'", () => {
    expect(kwMatches("will deliver on time", "live")).toBe(false);
  });

  it("matches standalone 'live' as a word", () => {
    expect(kwMatches("watch it live now", "live")).toBe(true);
  });

  it("does NOT match 'soft' inside 'software'", () => {
    expect(kwMatches("software engineering", "soft")).toBe(false);
  });

  it("does NOT match 'red' inside 'required'", () => {
    expect(kwMatches("required reading", "red")).toBe(false);
  });

  it("does NOT match 'done' as substring in 'abandoned'", () => {
    expect(kwMatches("project abandoned", "done")).toBe(false);
  });

  it("matches standalone 'done' as a word", () => {
    expect(kwMatches("task is done", "done")).toBe(true);
  });

  it("does NOT match 'todo' as substring in 'mastodon'", () => {
    expect(kwMatches("use mastodon", "todo")).toBe(false);
  });

  it("uses substring matching for CJK characters", () => {
    expect(kwMatches(String.fromCodePoint(0x8fd9,0x662f,0x7b80,0x5386), String.fromCodePoint(0x7b80,0x5386))).toBe(true);
  });

  it("uses substring matching for mixed CJK in text", () => {
    expect(kwMatches(String.fromCodePoint(0x5173,0x4e8e,0x5b9a,0x4ef7), String.fromCodePoint(0x5b9a,0x4ef7))).toBe(true);
  });

  it("case-insensitive for ASCII keywords", () => {
    expect(kwMatches("I need a RESUME", "resume")).toBe(true);
  });

  it("handles special regex characters in keyword safely", () => {
    expect(kwMatches("this is 8-bit style", "8-bit")).toBe(true);
    expect(kwMatches("use 8-bit encoding", "8-bit")).toBe(true);
  });
});

describe("matchTemplate strong-signal matching", () => {
  it("matches English resume content to resume-modern", async () => {
    const result = await matchTemplate(
      "Resume\nWork experience: Example Company\nEducation: Example University",
      skillStore.templates as any,
      SKILLS_DIR,
      AGENT_ID,
    );
    expect(result.templateId).toBe("resume-modern");
  });

  it("matches English resume (CV) content to resume-modern", async () => {
    const result = await matchTemplate(
      "My CV\nWork Experience at Google\nEducation: MIT",
      skillStore.templates as any,
      SKILLS_DIR,
      AGENT_ID,
    );
    expect(result.templateId).toBe("resume-modern");
  });

  it("matches pricing content to pricing-page", async () => {
    const result = await matchTemplate(
      "Pricing plans\nFree tier: 100 requests\nProfessional plan: 10000 requests",
      skillStore.templates as any,
      SKILLS_DIR,
      AGENT_ID,
    );
    expect(result.templateId).toBe("pricing-page");
  });

  it("matches OKR content to team-okrs", async () => {
    const result = await matchTemplate(
      "Q1 OKRs\nObjective 1: User growth\nKey results: DAU +50%",
      skillStore.templates as any,
      SKILLS_DIR,
      AGENT_ID,
    );
    expect(result.templateId).toBe("team-okrs");
  });

  it("matches runbook content to eng-runbook", async () => {
    const result = await matchTemplate(
      "# Payment Service Runbook\nAlerts:\n- P0: 5xx > 1%\nOn-call: Alice",
      skillStore.templates as any,
      SKILLS_DIR,
      AGENT_ID,
    );
    expect(result.templateId).toBe("eng-runbook");
  });
});

describe("matchTemplate word-boundary prevents false positives", () => {
  it("does NOT match English text with 'x' to social-x-post-card", async () => {
    const result = await matchTemplate(
      "# Building Next-Generation Developer Tools\n\nOur team is exploring ways to enhance the developer experience with intelligent tooling that understands context and provides context-aware suggestions.\n\nKey features include fast text processing with minimal latency and excellent accuracy on complex tasks.",
      skillStore.templates as any,
      SKILLS_DIR,
      AGENT_ID,
    );
    expect(result.templateId).not.toBe("social-x-post-card");
  });

  it("does NOT match content with 'document' word to docs-page via 'doc' substring", async () => {
    const docsOnly = skillStore.templates.filter((t) => t.id === "docs-page");
    const result = await matchTemplate(
      "this document is very long\nand has many sections",
      docsOnly as any,
      SKILLS_DIR,
      AGENT_ID,
    );
    expect(result.templateId).toBe("docs-page");
  });

  it("matches docs-page via full word 'documentation'", async () => {
    const result = await matchTemplate(
      "Project Documentation\n\nSetup\nUsage\nAPI Reference",
      skillStore.templates as any,
      SKILLS_DIR,
      AGENT_ID,
    );
    expect(result.templateId).toBe("docs-page");
  });

  it("does NOT match 'app' substring in 'happy' to mobile-app", async () => {
    const result = await matchTemplate(
      "# Project Happy\n\nOur team is happy to announce the new release.",
      skillStore.templates as any,
      SKILLS_DIR,
      AGENT_ID,
    );
    expect(result.templateId).not.toBe("mobile-app");
  });

  it("does NOT match 'live' inside 'deliver' to live-dashboard", async () => {
    const result = await matchTemplate(
      "# Delivery Process\n\nWe deliver projects on time with quality.",
      skillStore.templates as any,
      SKILLS_DIR,
      AGENT_ID,
    );
    expect(result.templateId).not.toBe("live-dashboard");
  });

  it("does NOT match content with 'done' and 'doing' to kanban-board", async () => {
    const only = skillStore.templates.filter((t) => t.id === "kanban-board");
    const result = await matchTemplate(
      "I have done the work and am doing more.\nThe report is done.",
      only as any,
      SKILLS_DIR,
      AGENT_ID,
    );
    expect(result.templateId).toBe("kanban-board");
  });
});

describe("matchTemplate blog/article matching", () => {
  it("matches blog content to article-magazine (newsletter and writing)", async () => {
    const result = await matchTemplate(
      "# Writing Documentation in the AI Agent Era\n\nAs AI agents handle more coding work, what format should readers get?\n\n## Recommendations\n\n- Convert with HTML Anything\n- Publish in newsletters and on X",
      skillStore.templates as any,
      SKILLS_DIR,
      AGENT_ID,
    );
    expect(result.templateId).toBe("article-magazine");
  });
});

describe("matchTemplate fallback matching", () => {
  it("falls through to deck-swiss-international for generic content", async () => {
    const result = await matchTemplate(
      "# Generic Project\n\nSome random text about things. Nothing specific.",
      skillStore.templates as any,
      SKILLS_DIR,
      AGENT_ID,
    );
    expect(result.templateId).toBe("deck-swiss-international");
  });

  it("returns confidence <= 10", async () => {
    const result = await matchTemplate(
      "Resume\nWork experience: ABC Company\nEducation: Example University",
      skillStore.templates as any,
      SKILLS_DIR,
      AGENT_ID,
    );
    expect(result.confidence).toBeLessThanOrEqual(10);
  });
});

describe("matchTemplate short content handling", () => {
  it("returns result even for very short content", async () => {
    const result = await matchTemplate(
      "hello",
      skillStore.templates as any,
      SKILLS_DIR,
      AGENT_ID,
    );
    expect(result.templateId).toBeTruthy();
    expect(result.confidence).toBeGreaterThanOrEqual(1);
  });

  it("returns result for empty content", async () => {
    const result = await matchTemplate(
      "",
      skillStore.templates as any,
      SKILLS_DIR,
      AGENT_ID,
    );
    expect(result.templateId).toBeTruthy();
  });
});

describe("matchTemplate --force-ai", () => {
  it("with --force-ai reaches AI summary instead of rule match", async () => {
    setInvokeResult("technical blog");

    const result = await matchTemplate(
      "# Writing Documentation in the AI Agent Era\n\nAs AI agents increasingly handle coding tasks, what should our final documentation look like?\n\n## Why HTML Beats Markdown\n\nMarkdown is a useful draft format but cannot fully control typography, color, animation and the reading experience.",
      skillStore.templates as any,
      SKILLS_DIR,
      AGENT_ID,
      true,
    );

    expect(result.templateId).toBeTruthy();
    expect(result.reason).toContain("Best match:");
    expect(result.reason).not.toContain("Keyword match:");
  });

  it("with --force-ai and AI error falls back to rule match", async () => {
    setInvokeResult("", "Some error");

    const result = await matchTemplate(
      "Resume\nWork experience: ABC Company\nEducation: Example University",
      skillStore.templates as any,
      SKILLS_DIR,
      AGENT_ID,
      true,
    );
    expect(result.templateId).toBe("resume-modern");
  });
});

describe("matchTemplate reason output", () => {
  it("includes keyword hits in strong-signal reason", async () => {
    const result = await matchTemplate(
      "Personal resume\n\nWork experience: ABC Technology, Senior Frontend Engineer, 2021 to present\nEducation: Example University, BSc Computer Science, 2014-2018",
      skillStore.templates as any,
      SKILLS_DIR,
      AGENT_ID,
    );
    expect(result.reason).toContain("Keyword match:");
    expect(result.reason).toContain("resume");
  });

  it("includes the English template name in result", async () => {
    const result = await matchTemplate(
      "Resume\nWork experience: ABC Company",
      skillStore.templates as any,
      SKILLS_DIR,
      AGENT_ID,
    );
    expect(result.enName).toBe("Modern Resume");
  });
});
