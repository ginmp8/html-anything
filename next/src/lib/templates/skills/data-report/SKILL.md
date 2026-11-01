---
name: data-report
description: Transform supplied CSV, JSON, spreadsheets, or tabular notes into a trustworthy single-file HTML data report with KPIs, charts, tables, and source-aware findings. Use for explanatory reporting; not for live admin dashboards or statistical experiment decisions.
---

# Data Visualization Report

## Purpose and boundaries
Convert user-provided data into a readable report without inventing data, sources, causation, or statistical certainty. Use dashboard for interactive monitoring and experiment-readout for A/B testing conclusions. The input may be a table plus narrative; treat narrative claims separately from computed values.

## Workflow
1. Identify fields, types, units, time zone, period, grain, missing values, duplicates, and relevant filters. Parse CSV quoting correctly and keep source row/column identity. If parsing is uncertain, disclose the ambiguity rather than silently changing a figure.
2. Compute only supported values. Show the numerator, denominator, grouping window, and method for ratios and changes. Never divide by zero or call a percentage-point change a percent change. Do not infer correlation as causation.
3. Plan the content from the actual data: title, period and provenance; supported KPI summary; one or more charts with clear questions; an exact-value table; evidence-backed observations; and a collapsible methodology section. Do not force two charts if the data supports only one.
4. Pick charts by structure: line for temporal observations, bars for comparisons, scatter only for paired numeric records, distributions only with adequate data. Charts and tables must derive from the same parsed source, with consistent formatting and sort order.
5. Label insights as computed finding, source-provided assertion, or hypothesis where needed. Provide an explicit evidence gap when the data cannot answer the question.

## HTML requirements
- Return a complete single-file HTML report with well-structured headings, readable typography, mobile layout, accessible chart captions, and an HTML table that remains usable without JavaScript.
- When using Chart.js with responsive true and maintainAspectRatio false, wrap every canvas in a parent with a fixed or constrained height (for example, position: relative; height: 280px). Never rely on canvas height attributes for CSS layout; unbounded containers can trigger resize loops.
- If using a CDN, include an inline fallback so the report remains readable offline. Use actual parsed numbers for visualization; escape untrusted cell content and do not interpolate it into script or markup unsafely.
- Use a restrained palette, textual legends, non-color status cues, visible focus styles, and concise methodology. User content determines the number of sections; no artificial minimum chart or card count.

## Acceptance
A reviewer can trace every displayed numerical value to an input or named calculation; source-provided statements are not presented as independently verified facts; absent data remains absent.
