import { describe, expect, it } from "vitest";
import { listSkills, loadSkill } from "../loader";

describe("portable bundled skill metadata", () => {
  it("loads canonical skill bodies and picker-only metadata", () => {
    const skills = listSkills();
    const incident = skills.find((skill) => skill.id === "incident-timeline");
    const architecture = skills.find((skill) => skill.id === "system-architecture-map");
    expect(incident).toMatchObject({
      enName: "Incident Timeline",
      scenario: "engineering",
      category: "data",
      example: { hasHtml: true, hasMd: true },
    });
    expect(architecture).toMatchObject({
      enName: "System Architecture Map",
      scenario: "engineering",
      example: { hasHtml: true, hasMd: true },
    });
    expect(loadSkill("incident-timeline")?.body).toContain("# Incident Timeline");
  });

  it("preserves upgraded skill categories, sample metadata and legacy skills", () => {
    const skills = listSkills();
    expect(skills.find((skill) => skill.id === "dashboard")).toMatchObject({
      enName: "Admin Dashboard",
      scenario: "operations",
      category: "dashboard",
    });
    expect(skills.find((skill) => skill.id === "data-report")).toMatchObject({
      enName: "Data Visualization Report",
      category: "data",
      featured: 10,
      example: { format: "csv", hasHtml: true, hasMd: true },
    });
    expect(skills.find((skill) => skill.id === "eng-runbook")).toMatchObject({
      enName: "Engineering Runbook",
      scenario: "engineering",
    });
  });
});
