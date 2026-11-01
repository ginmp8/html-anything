# html-anything CLI

Convert Markdown, plain text, CSV, and JSON into well-designed HTML from a terminal, without opening the graphical editor.

## Installation

~~~bash
cd html-anything
pnpm install
pnpm -F @html-anything/cli build
~~~

After building, optionally link the CLI globally:

~~~bash
cd cli
npm link
html-anything --help
~~~

Or define a shell alias pointing to the built executable:

~~~bash
alias html-anything="node /path/to/html-anything/cli/dist/run.js"
~~~

## Quick start

### 1. Configure the default template

~~~bash
html-anything templates
html-anything config set-default-template doc-kami-parchment
~~~

### 2. Convert input

~~~bash
# Match the best template automatically.
html-anything auto article.md

# Display the match without invoking an agent.
html-anything auto article.md --show-match-only

# Convert using the configured default template (article.html).
html-anything convert article.md

# Convert multiple files.
html-anything convert file1.md file2.md file3.md -d ./dist

# Choose an output file or directory.
html-anything convert article.md -o output.html
html-anything convert article.md -d ./dist

# Choose the template and local AI agent explicitly.
html-anything convert article.md -t resume-modern
html-anything convert article.md -a claude --model sonnet

# Read from standard input.
cat article.md | html-anything convert -o page.html
~~~

### 3. Review the result

~~~bash
open output.html
~~~

## Command reference

### convert and auto

Both commands accept the following common arguments:

| Argument | Short | Meaning | Default |
| --- | --- | --- | --- |
| input | — | Input file; omit for stdin | stdin |
| --agent <id> | -a | Local AI agent | First detected and supported agent |
| --output <path> | -o | Output file | Input stem with an .html extension, or stdout for stdin |
| --output-dir <dir> | -d | Output directory | Working directory |
| --model <id> | — | Agent model | Agent default |
| --format <type> | — | Input format: markdown, text, csv, json | markdown |

#### convert: explicit template

~~~bash
html-anything convert [input] [options]
~~~

Use the configured default template or supply --template (short flag -t) with a template ID.

#### auto: automatic matching

~~~bash
html-anything auto [input] [options]
~~~

Matches the input against the available skill templates, then converts it.

| Argument | Meaning |
| --- | --- |
| --force-ai | Skip the rule-based shortcut and request an AI topic summary |
| --show-match-only | Show the selected template without generating HTML |

### templates: list templates

~~~bash
html-anything templates
~~~

Lists templates by category. The configured default is marked (default).

### agents: list local agents

~~~bash
html-anything agents
~~~

Lists detected local AI agent CLI tools and their availability.

### config: manage configuration

~~~bash
html-anything config
html-anything config set-default-template <id>
html-anything config set-default-agent <id>
html-anything config set-model <id>
html-anything config reset
~~~

Configuration is stored at ~/.config/html-anything/config.json.

## Supported local AI CLIs

HTML Anything invokes an existing local agent CLI. The local agent handles generation; HTML Anything supplies the assembled prompt and consumes the generated HTML.

| Agent | Typical installation |
| --- | --- |
| Claude Code | npm install -g @anthropic-ai/claude-code |
| OpenAI Codex | npm install -g @openai/codex |
| Cursor Agent | Install the Cursor Agent CLI |
| Gemini CLI | npm install -g @google/gemini-cli |
| GitHub Copilot CLI | npm install -g @github/copilot-cli |
| OpenCode | Consult the official OpenCode installation guide |
| Qwen Coder | Consult official Qwen Coder documentation |
| CodeWhale | Consult the project installation guide |
| DeepSeek TUI | Consult the project installation guide |
| Aider | pip install aider-chat |
| OpenClaw | Consult official installation instructions |

Protocol support depends on the installed agent version and the application's adapter. Detection does not imply every protocol is supported for conversion.

## Recommended templates

| Template ID | Intended use |
| --- | --- |
| doc-kami-parchment | Editorial document and long-form report |
| resume-modern | Printable A4 resume |
| deck-swiss-international | Slide presentation |
| deck-guizang-editorial | Magazine-inspired slides |
| magazine-poster | Poster and editorial announcement |
| blog-post | Technical blog post |
| data-report | Data visualization report |
| card-xiaohongshu | Social-media content cards |
| prototype-web | Interactive web prototype |
| saas-landing | SaaS landing page |

## Complete example

~~~bash
# 1. Inspect templates.
html-anything templates

# 2. Set a default.
html-anything config set-default-template doc-kami-parchment

# 3. Create a Markdown document.
cat > my-article.md << 'EOF'
# Project Summary

## Background
This project helps teams publish readable technical documentation.

## Outcomes
- Delivered feature A
- Improved module B

## Next steps
Finish the next phase in Q3.
EOF

# 4. Match and convert.
html-anything auto my-article.md

# 5. View the output.
open my-article.html

# 6. See the selected template without generating.
html-anything auto my-article.md --show-match-only

# 7. Change the visual style.
html-anything convert my-article.md -t blog-post -o my-article-v2.html

# 8. Use another output directory.
html-anything convert my-article.md -d ./output
~~~

## Development

~~~bash
pnpm -F @html-anything/cli dev -- templates
pnpm -F @html-anything/cli typecheck
pnpm -F @html-anything/cli build
~~~

## Architecture

### convert

1. **Template loading:** Load a skill prompt from next/src/lib/templates/skills/.
2. **Prompt assembly:** Combine global design guidance, template instructions, and user input.
3. **Agent invocation:** Run the selected local AI CLI and stream its response.
4. **HTML extraction:** Extract the completed HTML document from the streamed output.
5. **Output:** Write the HTML to a file or print it to standard output.

### auto

1. **Strong signals:** Match common terms such as resume, pricing, OKRs, and weekly updates. This step does not call a model.
2. **Metadata scoring:** Rank candidate templates using their names, descriptions, categories, tags, and scenario keywords.
3. **AI fallback:** For ambiguous longer inputs, ask the local AI agent for a short document-type summary, then score the summary.
4. **Default fallback:** Use a general-purpose template when no candidate scores sufficiently.

The CLI reuses the user's existing local agent installation. Its progress output reports received text chunks and elapsed time.
