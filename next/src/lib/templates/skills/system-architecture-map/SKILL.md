---
name: system-architecture-map
description: Convert documented components, calls, data stores, trust boundaries, and dependencies into a source-grounded single-file HTML system architecture map. Use for technical overviews and design reviews; not for reverse engineering without evidence or fabricating cloud resources and network routes.
---

# System Architecture Map

## Purpose and boundaries
Make a system's current or proposed architecture comprehensible from supplied descriptions, diagrams, configurations, or inventory. This is a representation of evidence, not an autonomous discovery scan or claim of exhaustive topology.

## Workflow
1. Extract component inventory, responsibilities, ingress/egress edges, protocols, direction, data classification, trust zones, deployment boundaries, and source references. Tag each as observed, proposed, inferred, or unknown.
2. Separate current-state and target-state diagrams if both are present. Do not merge alternatives into one purportedly deployed architecture.
3. Choose a legible topology: systems and actors outside; gateways and services in the middle; queues, storage, and external dependencies at the edge. Draw only supported edges and label direction and protocol where known.
4. Build a responsive architecture overview with a concise legend, node/edge diagram, and a searchable or readable component-to-dependency table. Include constraints, assumptions, failure boundaries, and unanswered questions when supported.
5. Distinguish synchronous calls from asynchronous messaging, data lineage from control flow, and trust-boundary crossings from ordinary dependencies.
6. When information is incomplete, leave unknown paths explicit; do not invent services, IAM permissions, VPCs, retries, SLAs, ports, or security properties.

## HTML and design contract
- Return a single complete HTML file with inline SVG or CSS for the diagram, without relying on an external layout service. Keep the source input as data, escaped before insertion into markup.
- Use grouped regions, visual hierarchy, simple shapes, restrained colors, and direct labels. Avoid decorative pseudo-topology, tiny illegible nodes, and edge spaghetti.
- Support zoom or horizontal scrolling for complex diagrams while keeping keyboard access. Provide an equivalent tabular listing of every connection; do not encode important facts only by color or hover.
- Use semantic headings, SVG title/description, visible focus indicators, accessible contrast, and print-friendly layout. If the inventory is too large, group by service boundary and preserve every entity in the table rather than silently dropping it.

## Verification
Confirm every node and edge has an input source or is explicitly labeled as a proposal/inference; verify arrow direction, names, boundary labels, and contradictions.
