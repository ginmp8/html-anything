# Portable skill template format

HTML Anything loads bundled templates from next/src/lib/templates/skills/<id>/ and marketplace templates from user skill packages. The Web and CLI readers accept two metadata formats:

1. **Legacy:** display metadata in SKILL.md frontmatter (retained for existing templates).
2. **Portable:** SKILL.md frontmatter contains only the standard Agent Skills name and description. Put application-specific presentation metadata in the adjacent optional template.json.

The portable format separates the agent's activation contract from the HTML Anything template picker. The sidecar may define: en_name, emoji, category, scenario, aspect_hint, featured, recommended, tags, example_id, example_name, example_format, example_tagline, example_desc, example_source_url, and example_source_label. It cannot override name, description, or instructions.

For a new portable template:

- Name the directory with a stable kebab-case ID matching the SKILL.md name.
- Author a discriminative description (500 characters or fewer) and an actionable body. The shared prompt wrapper still requires a complete single-file HTML response, sourced from user content.
- Supply template.json for accurate gallery categorization and search; reuse an existing scenario key from next/src/lib/templates/scenarios.ts.
- Optionally supply example.md and example.html; clearly label synthetic examples. The HTML is presented as a static preview, not a claimed model run.
- Maintain VERSION (SemVer) and a matching CHANGELOG.md entry. Bundled readers ignore these files, while Agent Skills packaging can use them.
- Keep direct resources under the skill directory. Never add secrets, live environment values, unsafe scripts, or unverifiable claims.

Invalid or oversized template.json is ignored so existing metadata remains available. Unknown sidecar keys are ignored. The Web and CLI loaders use equivalent validation rules. Bundled and marketplace templates use the English display name from `en_name`, falling back to the canonical `name` or directory ID. Do not add redundant language-specific name aliases.

Validation: run the existing Web/CLI test suites and the portable skill structural/version validators before release. A passing static gate does not prove generated-HTML visual or behavioral quality.
