import { loadSkill, type SkillMeta } from "./skills-loader.js";
import { invokeAgent } from "./agents-invoke.js";

const CONFIDENCE_THRESHOLD = 3;
const MIN_CONTENT_LENGTH_FOR_AI = 60;

const STRONG_SIGNALS: [keywords: string[], templateId: string][] = [
  [["resume","CV","work history","curriculum vitae"],"resume-modern"],
  [["pricing","plans","pricing tiers","subscription plans"],"pricing-page"],
  [["OKR","KR","objectives","key results","quarterly goals"],"team-okrs"],
  [["PRD","spec","user stories","product requirements"],"pm-spec"],
  [["weekly","weekly report"],"weekly-update"],
  [["Runbook","runbook","oncall","on-call","SRE","incident","incident response"],"eng-runbook"],
  [["invoice","tax","billing"],"invoice"],
  [["onboarding","onboard","new hire"],"hr-onboarding"],
  [["SaaS","landing","hero","social proof"],"saas-landing"],
  [["waitlist","coming soon"],"waitlist-page"],
  [["meeting","notes","action items","meeting minutes"],"meeting-notes"],
  [["kanban","board"],"kanban-board"],
  [["Dashboard","dashboard","KPI","analytics","monitoring"],"dashboard"],
  [["social media","follower","followers"],"social-media-dashboard"],
  [["blog","magazine","newsletter","essay","writing"],"article-magazine"],
  [["blog","post","blog post"],"blog-post"],
  [["docs","documentation","doc"],"docs-page"],
  [["xiaohongshu"],"card-xiaohongshu"],
  [["twitter","tweet","𝕏"],"social-x-post-card"],
  [["Spotify","spotify","now playing"],"social-spotify-card"],
  [["Reddit","reddit","upvote"],"social-reddit-card"],
  [["Instagram","linkedin","carousel","thread"],"social-carousel"],
  [["poster"],"poster-hero"],
  [["finance report","financial statements"],"finance-report"],
  [["data report","chart","statistics","data analysis"],"data-report"],
  [["live","chat"],"live-dashboard"],
  [["PPT","deck","slides","presentation","keynote"],"deck-swiss-international"],
  [["prototype","wireframe","mockup","sketch"],"prototype-web"],
  [["video","hyperframes","remotion","mp4","motion"],"video-hyperframes"],
  [["VFX","cursor","chromatic","reveal"],"vfx-text-cursor"],
  [["dating","profile"],"dating-web"],
  [["App","mobile","H5"],"mobile-app"],
  [["course","module"],"deck-course-module"],
  [["team dashboard","flow","ticket","flowai"],"flowai-team-dashboard"],
  [["eguide","guide"],"digital-eguide"],
  [["kami","parchment"],"doc-kami-parchment"],
  [["email","EDM","newsletter email"],"email-marketing"],
  [["Apple","iOS","soft","squircle"],"web-proto-soft"],
  [["brutalist","swiss","industrial print"],"web-proto-brutalist"],
  [["editorial","serif"],"web-proto-editorial"],
  [["gamified","badge"],"gamified-app"],
  [["macOS","notification"],"frame-macos-notification"],
  [["glitch","cyber","cyberpunk"],"deck-hermes-cyber"],
  [["glitch","title"],"frame-glitch-title"],
  [["liquid","blob","hero"],"frame-liquid-bg-hero"],
  [["logo","outro","brand"],"frame-logo-outro"],
  [["light leak","cinema"],"frame-light-leak-cinema"],
  [["flowchart","sticky"],"frame-flowchart-sticky"],
  [["chart","NYT","data chart","infographic"],"frame-data-chart-nyt"],
  [["3D","3d","mockup","device","iPhone","MacBook"],"mockup-device-3d"],
  [["pixel","8-bit"],"sprite-animation"],
  [["motion"],"motion-frames"],
  [["pitch","pitch deck","BP"],"deck-pitch"],
  [["product","launch","product launch"],"deck-product-launch"],
  [["simple","deck"],"deck-simple"],
  [["swiss","international","presentation"],"deck-swiss-international"],
  [["graphify","graph","dark"],"deck-graphify-dark"],
  [["obsidian"],"deck-obsidian-claude"],
  [["guizang","ink","editorial deck"],"deck-guizang-editorial"],
  [["magazine","web"],"deck-magazine-web"],
  [["safety","alert","warning"],"deck-safety-alert"],
  [["blueprint"],"deck-blueprint"],
  [["replit","terminal"],"deck-replit"],
  [["keyboard","nav"],"deck-dir-key-nav"],
  [["open slide","canvas"],"deck-open-slide-canvas"],
  [["presenter"],"deck-presenter-mode"],
  [["tech","sharing","tech talk"],"deck-tech-sharing"],
  [["xhs","xiaohongshu deck"],"deck-xhs-post"],
  [["XHS","pastel"],"deck-xhs-pastel"],
  [["XHS","white"],"deck-xhs-white"],
  [["mobile","onboarding"],"mobile-onboarding"],
  [["magazine","poster"],"magazine-poster"],
];

const SCENARIO_SIGNALS: Record<string, string[]> = {
  marketing: ["marketing","brand","campaign","landing page","conversion"],
  engineering: ["code","engineering","deploy","CI/CD","git","arch","SRE","devops","oncall"],
  operations: ["operation","ops","weekly","standup","process","retro"],
  product: ["product","PM","PRD","requirement","feature","spec","roadmap","OKR","user story"],
  design: ["design","UI","UX","prototype","mockup","wireframe","typography"],
  finance: ["finance","revenue","expense","invoice","tax"],
  sales: ["sales","pricing","plan","subscription","discount"],
  hr: ["HR","hire","onboard","resume","CV","interview","employee"],
  personal: ["personal","resume","CV","spotify","music"],
  education: ["education","course","tutorial","learn"],
  creator: ["creator","social media","follower","KOL"],
  video: ["video","frame","hyperframes","remotion","animation","VFX","intro"],
};

export interface MatchResult {
  templateId: string;
  enName: string;
  confidence: number;
  reason: string;
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[\uFF0C,\u3002\uFF1B;\uFF01!\uFF1F?\u3001\s]+/g, " ").trim();
}

function isAscii(s: string): boolean {
  return /^[\x00-\x7F]+$/.test(s);
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function kwMatches(haystack: string, needle: string): boolean {
  const kw = needle.toLowerCase();
  if (isAscii(kw)) {
    return new RegExp("\\b" + escapeRegExp(kw) + "\\b", "i").test(haystack);
  }
  return haystack.includes(kw);
}

function ruleMatch(content: string, meta: SkillMeta): number {
  const lower = normalize(content);
  let score = 0;

  for (const tag of meta.tags) {
    if (kwMatches(lower, tag)) score += 3;
  }

  const nameWords = normalize(meta.enName).split(" ").filter((w) => w.length >= 2);
  const descWords = normalize(meta.description).split(" ").filter((w) => w.length >= 3);

  for (const w of nameWords) {
    if (lower.includes(w)) score += 2;
  }
  for (const w of descWords) {
    if (lower.includes(w)) score += 1;
  }

  const scenarioKeywords = SCENARIO_SIGNALS[meta.scenario] ?? [];
  for (const kw of scenarioKeywords) {
    if (kwMatches(lower, kw)) score += 1;
  }

  return score;
}

function strongSignalMatch(
  content: string,
  skillsDir: string,
): MatchResult | null {
  let best: { templateId: string; confidence: number; matched: string[] } | null = null;
  const lower = normalize(content);

  for (const [keywords, templateId] of STRONG_SIGNALS) {
    const matched = keywords.filter((kw) => kwMatches(lower, kw));
    if (matched.length > 0) {
      const confidence = matched.length * 2 + 3;
      if (!best || confidence > best.confidence) {
        best = { templateId, confidence, matched };
      }
    }
  }

  if (best && best.confidence >= CONFIDENCE_THRESHOLD) {
    const meta = loadSkill(skillsDir, best.templateId);
    const name = meta?.enName ?? best.templateId;
    return {
      templateId: best.templateId,
      enName: name,
      confidence: best.confidence,
      reason: `Keyword match: ${best.matched.join(", ")} → ${name}`,
    };
  }

  return null;
}

function fallbackMatch(content: string, templates: SkillMeta[]): MatchResult | null {
  let best: SkillMeta | null = null;
  let bestScore = 0;

  for (const t of templates) {
    const score = ruleMatch(content, t);
    if (score > bestScore) {
      bestScore = score;
      best = t;
    }
  }

  if (!best || bestScore < 1) return null;

  return {
    templateId: best.id,
    enName: best.enName,
    confidence: bestScore,
    reason: `Best match: ${best.enName} (scenario: ${best.scenario}, score: ${bestScore})`,
  };
}

async function aiSummaryMatch(
  content: string,
  templates: SkillMeta[],
  agentId: string,
): Promise<MatchResult | null> {
  let summary = "";
  try {
    const prompt = `Identify the document type that best describes this content in one short phrase (up to 15 words). Reply with only the type name:

${content.slice(0, 800)}

Document type:`;

    const stream = invokeAgent({ agent: agentId, prompt });
    const reader = stream.getReader();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value?.type === "delta") summary += value.text;
      if (value?.type === "html") summary = value.text;
      if (value?.type === "error") return null;
    }
  } catch {
    return null;
  }

  const clean = normalize(summary).trim();
  if (!clean || clean.length > 100) return null;

  return fallbackMatch(clean, templates);
}

export async function matchTemplate(
  content: string,
  templates: SkillMeta[],
  skillsDir: string,
  agentId: string,
  forceAi: boolean = false,
): Promise<MatchResult> {
  if (!forceAi) {
    const strong = strongSignalMatch(content, skillsDir);
    if (strong) {
      strong.confidence = Math.min(strong.confidence, 10);
      return strong;
    }
  }

  const rule = fallbackMatch(content, templates);
  if (!forceAi && rule && rule.confidence >= CONFIDENCE_THRESHOLD) {
    rule.confidence = Math.min(rule.confidence, 10);
    return rule;
  }

  if (content.length < MIN_CONTENT_LENGTH_FOR_AI) {
    if (rule) {
      rule.confidence = Math.min(rule.confidence, 10);
      return rule;
    }
    const fallback = templates.find((t) => t.id === "deck-swiss-international") ?? templates[0];
    return {
      templateId: fallback.id,
      enName: fallback.enName,
      confidence: 1,
      reason: "Content is short; using a general-purpose template",
    };
  }

  const ai = await aiSummaryMatch(content, templates, agentId);
  if (ai) {
    ai.confidence = Math.min(ai.confidence, 10);
    return ai;
  }

  if (rule) {
    rule.confidence = Math.min(rule.confidence, 10);
    return rule;
  }

  const fallback = templates.find((t) => t.id === "deck-swiss-international") ?? templates[0];
  return {
    templateId: fallback.id,
    enName: fallback.enName,
    confidence: 1,
    reason: "Unable to identify subject; using the default template",
  };
}
