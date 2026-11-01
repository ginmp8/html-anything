import { NextRequest } from "next/server";
import { invokeAgent } from "@/lib/agents/invoke";
import { loadSkill } from "@/lib/templates/loader";
import { assemblePrompt } from "@/lib/templates/shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  agent: string;
  templateId: string;
  content: string;
  format?: string;
  model?: string;
  cwd?: string;
  /**
   * Optional absolute path to the agent binary. The Settings UI lets the
   * user override auto-detection when their CLI lives somewhere our PATH
   * scan doesn't cover (Scoop on Windows, custom installs, etc.).
   */
  binOverride?: string;
  /** When the task already has a generated HTML, the client sends both the
   *  prior HTML and the prior content. The agent is then asked for a
   *  minimal-diff edit (preserve design, only change what the content diff
   *  implies). Saves output tokens AND prevents creative drift between runs. */
  editFromHtml?: string;
  editFromContent?: string;
};

function buildEditPrompt(args: {
  templateName: string;
  templateAspect: string;
  newContent: string;
  oldContent: string;
  oldHtml: string;
  format: string;
}): string {
  return `You are performing a minimal-diff edit of an existing HTML document, not generating a new design from scratch.

Template style: ${args.templateName} (${args.templateAspect})
Input format: ${args.format}

[REQUIRED RULES]
1. Return the complete updated HTML document only. Its first character must be < and its last tag must be </html>.
2. Do not include Markdown fences or explanatory text.
3. Do not use file writing or shell tools; stream the HTML in your reply so the caller can persist it.
4. Preserve the existing head, fonts, styles, layout, DOM hierarchy, palette, grid, components, and animations unless the content change requires a specific alteration.
5. Update only nodes corresponding to differences between the previous and new content.
6. Add or remove repeated cards, rows, slides, or sections only when entries are added or removed; reuse the existing structure.
7. Do not redesign, reformat or reorganize unrelated material for small edits.
8. Do not invent data or add claims absent from the new source.

[PREVIOUS CONTENT]
${args.oldContent}

[NEW CONTENT]
${args.newContent}

[EXISTING HTML -- edit this and return the complete updated document]
${args.oldHtml}
`;
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return new Response("invalid JSON body", { status: 400 });
  }
  const {
    agent,
    templateId,
    content,
    format = "text",
    model,
    cwd,
    binOverride,
    editFromHtml,
    editFromContent,
  } = body;
  if (!agent || !templateId || !content) {
    return new Response("missing required fields: agent, templateId, content", {
      status: 400,
    });
  }
  const skill = loadSkill(templateId);
  if (!skill) {
    return new Response(`unknown template: ${templateId}`, { status: 400 });
  }

  let prompt: string;
  if (editFromHtml && editFromContent) {
    prompt = buildEditPrompt({
      templateName: skill.enName,
      templateAspect: skill.aspectHint,
      newContent: content,
      oldContent: editFromContent,
      oldHtml: editFromHtml,
      format,
    });
  } else {
    prompt = assemblePrompt({ body: skill.body, content, format });
  }
  const abortCtl = new AbortController();
  req.signal?.addEventListener("abort", () => abortCtl.abort(), { once: true });

  const stream = invokeAgent({
    agent,
    prompt,
    model,
    cwd,
    binOverride,
    signal: abortCtl.signal,
  });

  const sse = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      let outClosed = false;
      const send = (event: string, data: unknown) => {
        if (outClosed) return;
        try {
          controller.enqueue(
            enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
          );
        } catch {
          outClosed = true;
        }
      };

      const reader = stream.getReader();
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (!value) continue;
          send(value.type, value);
        }
      } catch (err) {
        send("error", {
          message: err instanceof Error ? err.message : String(err),
        });
      } finally {
        outClosed = true;
        try {
          controller.close();
        } catch {}
      }
    },
    cancel() {
      abortCtl.abort();
    },
  });

  return new Response(sse, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
