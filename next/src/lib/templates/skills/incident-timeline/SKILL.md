---
name: incident-timeline
description: Reconstruct an evidence-linked incident timeline as an accessible, single-file HTML briefing from event logs, alerts, tickets, and incident notes. Use for retrospectives and incident status reviews; not for live alerting, unverifiable root-cause claims, or creating operational commands.
---

# Incident Timeline

## Purpose and boundaries
Create a defensible chronology of an incident, separating observed events, reported claims, inferred relationships, and unknowns. This is not an incident responder, monitoring integration, or substitute for a runbook.

## Workflow
1. Read the supplied sources and identify incident scope, impacted service, severity if stated, event timestamp, original time zone, source reference, actor, event type, and confidence. Distinguish event time from ingestion and report time.
2. Normalize event ordering to one explicitly labeled time zone without discarding original timestamps. Keep simultaneous events together; show uncertain ranges or disputed ordering instead of inventing precision.
3. Deduplicate repeated notifications only when they refer to the same event; preserve retry, reappearance, and contradictory evidence as distinct annotated events.
4. Build a chronology with phases when supported: detection, triage, mitigation, recovery, verification, and follow-up. Show the impact and duration only when start/end boundaries are evidenced. Acknowledge unresolved or ongoing incidents.
5. Provide a source-keyed event ledger with timestamp, event, evidence, and confidence, plus known impact, open questions, and owner/action items only when supplied.
6. If no real incidents are supplied, show a usable empty-state or explicitly labeled sample, never an unlabeled invented incident.

## Visual contract
- Produce one complete HTML document. Use a restrained time-axis visualization with legible event markers, severity labels that do not rely on color alone, a compact facts panel, and a chronological table as the accessible fallback.
- Use semantic time elements, coherent heading order, keyboard-readable links, mobile stacked layout, and print-friendly styles. Charts must not hide source evidence behind hover-only controls.
- Do not include private identifiers, secrets, complete payloads, or raw tokens that are not needed to understand the sequence. Quote or summarize safely and preserve provenance labels.
- Keep observation, inference, and hypothesis visibly distinct. Never identify a root cause, recovery time, person responsible, or fault without corroborating evidence.

## Final verification
Check ordering, time-zone conversion, duplicate handling, evidence links, whether the event-to-impact inference is actually supported, and whether unknowns are clearly marked.
