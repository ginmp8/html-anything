import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { listSkills, loadSkill } from "../skills-loader.js";

const roots: string[] = [];
function fixture(sidecar: string): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ha-sidecar-"));
  roots.push(root);
  const dir = path.join(root, "demo");
  fs.mkdirSync(dir);
  fs.writeFileSync(path.join(dir, "SKILL.md"), [
    "---",
    "name: demo",
    "description: Canonical portable activation description.",
    "---",
    "# Portable body",
  ].join("\n"));
  fs.writeFileSync(path.join(dir, "template.json"), sidecar);
  return root;
}
afterEach(() => {
  for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true });
});

describe("CLI template.json metadata compatibility", () => {
  it("reads valid display fields without replacing the skill instructions", () => {
    const root = fixture(JSON.stringify({
      zh_name: "Demo", en_name: "Demo Report", scenario: "engineering",
      category: "doc", featured: 2, tags: ["docs"],
      name: "malicious-name", description: "Sidecar cannot replace activation",
    }));
    expect(listSkills(root)[0]).toMatchObject({
      id: "demo", enName: "Demo Report", scenario: "engineering",
      featured: 2, tags: ["docs"], description: "Canonical portable activation description.",
    });
    expect(loadSkill(root, "demo")?.body).toBe("# Portable body");
  });

  it("ignores malformed JSON and preserves legacy fallback", () => {
    const root = fixture("{broken");
    expect(listSkills(root)[0]).toMatchObject({
      id: "demo", enName: "demo", category: "other", scenario: "marketing",
    });
    expect(loadSkill(root, "demo")?.description).toBe("Canonical portable activation description.");
  });


  it("rejects unsafe example source URLs", () => {
    const root = fixture(JSON.stringify({
      example_id: "sample", example_source_url: "javascript:alert(1)",
      example_source_label: "Open",
    }));
    expect(listSkills(root)[0].example?.source).toBeUndefined();
  });

  it("ignores invalid metadata values instead of rendering them", () => {
    const root = fixture(JSON.stringify({ en_name: 123, featured: -2, tags: [1, null] }));
    expect(listSkills(root)[0]).toMatchObject({
      id: "demo", enName: "demo", tags: [],
    });
    expect(listSkills(root)[0].featured).toBeUndefined();
  });
});
