---
name: dashboard
description: Create a responsive, accessible admin or operations dashboard in single-file HTML using supplied KPIs, trends, tables, and business definitions. Use for operational monitoring and analytics overviews; not for experiment causal readouts, financial statements, or fictional metrics.
---

# Admin Dashboard

## Purpose and activation
Produce an actionable, visually coherent dashboard from the user's actual measures and operational context. This is a read-only presentation, not a connected monitoring system unless the user supplies a working integration. For comparative experiments use the experiment-readout template; for a narrative data report use data-report.

## Execution
1. Inventory measures, dimensions, time windows, definitions, sources, freshness, and any thresholds. Preserve units and denominators. If a field is missing, label it "Not provided" rather than fabricating a value.
2. Organize the page around the user's question: overview header and period, navigation, a small set of primary KPIs, trend or distribution panels supported by the data, then a recent activity or records table only when records exist.
3. Match each chart to the supplied data. Use lines for time series, bars for category comparisons, and tables for exact values; do not render a chart when fewer data points than required are available. Always show the reporting window and units.
4. Explain deltas accurately: percentage change is not percentage-point change; compare like-for-like periods and disclose non-comparable periods. Mark missing observations as missing, never zero.
5. Build one complete HTML document with inline layout and meaningful content. Use semantic landmarks, a real heading hierarchy, accessible labels, keyboard focus indicators, and an HTML table or textual summary for every chart.

## Visual and interaction contract
- Desktop: clear left navigation, restrained top bar, KPI overview, one dominant chart, and secondary panels. Mobile: collapsible or stacked navigation, single-column panels, no horizontal viewport overflow.
- Give charts finite container dimensions. If using a chart library, provide a usable no-JavaScript table or SVG fallback so the report remains intelligible when external assets fail.
- Use one strong visual accent, aligned numeric columns, concise source captions, and consistent status language. Avoid a wall of identical cards and gratuitous animation.
- Controls must work: filtering changes visible values and descriptions consistently; inactive integrations are labeled as unavailable rather than represented by fake action buttons.
- Render states explicitly: no data, missing field, stale data, and loading only when a real loading action exists. Do not invent activity entries, dates, users, thresholds, benchmarks, or sources.

## Final checks
Verify source-to-display consistency, totals and units, responsive layout, contrast and keyboard access. When claims of live data or freshness cannot be substantiated, describe the page as a static snapshot.
