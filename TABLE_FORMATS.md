# Benchmark table formats

This document is the source of truth for result tables on the PickleShell
website. Check it before adding or changing a table. The current isolated patch
table in `model-comparison-phase2-patch-current.html` is the primary visual and
semantic reference.

## Shared rules

- Use a horizontally scrollable table inside `.table-scroll`.
- Include an accessible `<caption>` and sortable `<button>` elements in column
  headings when sorting is available.
- Keep one result per row and one meaning per column. Never expose internal
  numeric flags such as `agent_status = 0` or `evaluator_status = 1`.
- Put the human-readable run status below the rank in the first column. Allowed
  labels include `completed`, `tests_failed`, `objective_failed`,
  `forbidden_changes`, `agent_failure`, and `unavailable`.
- Every failed or unavailable row must offer a model-specific explanation
  through its status badge. Use the sanitized artifact to state the failed
  stage, the observable event, and whether a task, patch, or public-test result
  exists. A raw code such as `process_failure` is not a sufficient explanation.
- Keep deterministic checks (`Public` and `Objective` or historical `Hidden`)
  separate from the four review scores.
- Review criteria are integer values from 0 to 10. `Overall` is their arithmetic
  mean and may be fractional. Missing reviews display `N/A`; they are not zero.
- Time is agent wall-clock solution time in seconds with three decimal places.
  It is not a model inference-speed measurement.
- Cost is solution-only provider-reported USD. Unknown cost displays `N/A` and
  must not be reconstructed.
- When an access/provider column is present, do not repeat the provider in
  parentheses after the model name.
- Keep unavailable and failed runs in the table. Sort them after scored runs;
  do not silently remove them.
- A row must have exactly the same number of cells as the header.
- Use the same badge colors and `N/A` treatment across table families.

## Shared table component

Current single-task result pages must use `benchmark-table.js` and
`benchmark-table.css`. A page declares only the result source:

```html
<section
  class="results-table"
  data-benchmark-table
  data-results="results/tables/example.json"
></section>
<link rel="stylesheet" href="benchmark-table.css" />
<script src="benchmark-table.js"></script>
```

The component owns the table markup, column order, sorting, ranks, badges,
missing-value formatting, time and cost formatting, and accessible header
state. Do not copy table markup or a renderer into an individual result page.

Table data belongs in `results/tables/`. Each JSON document contains page
metadata and normalized rows:

```json
{
  "title": "Complete candidate results",
  "caption": "Example benchmark results",
  "ariaLabel": "Sortable example model comparison table",
  "rows": [
    {
      "id": "01-example",
      "label": "Example Model",
      "status": "completed",
      "public": "Pass",
      "objective": "Pass",
      "scores": [10, 9, 9, 10],
      "time": 42.123,
      "cost": 0.01,
      "channel": "Example Provider"
    }
  ]
}
```

Use `null` for unknown values. A failed row may add `failureDetail` with a
sanitized, model-specific explanation. Updating results should require editing
only the corresponding JSON file; edit the shared component only when the
format itself changes.

## Format A: current single-task benchmark

Use this for current isolated and clean-room task results. This is the default.

| Position | Heading | Content |
|---:|---|---|
| 1 | Rank / status | Canonical rank plus human-readable status badge |
| 2 | Model | Model name and optional candidate/route ID; no provider suffix |
| 3 | Public | Pass/fail badge for public tests |
| 4 | Objective | Pass/fail badge; `Hidden` is allowed only on historical pages |
| 5 | Functional | Integer review score, 0–10, or `N/A` |
| 6 | Reliability | Integer review score, 0–10, or `N/A` |
| 7 | Maintainability | Integer review score, 0–10, or `N/A` |
| 8 | Scope | Integer review score, 0–10, or `N/A` |
| 9 | Overall | Arithmetic mean of columns 5–8 |
| 10 | Time (s) | Agent wall-clock solution time |
| 11 | Cost | Provider-reported solution cost or `N/A` |
| 12 | Channel | Access channel/provider route |

Longer criterion headings such as `Functional correctness` and `Scope
discipline` are acceptable when space permits. They do not create a different
format.

Reference page: `model-comparison-phase2-patch-current.html`.

## Format B: historical single-task archive

Historical tables may use `Hidden` instead of `Objective` and may add a final
`Evidence` column when every row links to an immutable record. Otherwise they
follow Format A.

If historical cost or channel data is unavailable, omit those columns rather
than filling them with invented values. The expected order is:

1. Rank / status
2. Model
3. Public
4. Hidden
5. Functional
6. Reliability
7. Maintainability
8. Scope
9. Overall
10. Time (s)
11. Evidence (optional)

Do not add separate `Record status`, `Agent status`, or `Evaluator status`
columns. Their meaningful state belongs under `Rank / status`; deterministic
failure evidence belongs in `Public` and `Hidden`.

## Format C: multi-task aggregate

Use only when one row summarizes several tasks. Start with the shared Format A
identity and scoring columns, but permit these aggregate measurements before
the review criteria:

- `Reviewed`: reviewed patches divided by total tasks;
- `Harnesses passed`: tasks where all required deterministic checks passed;
- `Public`: public-test pass count;
- `Hidden` or `Objective`: objective pass count.

Use `Avg time (s)` rather than `Time (s)`. An `Evidence` column may link to the
candidate's aggregate records. Status must still be human-readable under the
rank; raw numeric status columns are prohibited.

Reference page: `model-comparison-phase2.html`.

## Format D: legacy Phase 1 quality table

The Phase 1 ledger table predates the four-criterion rubric and may retain its
five dimensions: `Simplicity`, `Readability`, `No extra code`, `Reliability`,
and `Edge cases`. It must still follow the shared rules for rank/status, time,
channel, cost, missing values, and provider naming.

Reference page: `model-comparison.html`.

## Current table inventory and comparison

| Pages | Family | Current columns | Comparison with standard |
|---|---|---:|---|
| `model-comparison-phase2-patch-current.html` | A | 12 | Canonical reference |
| `llm-test-bug-fixing.html` and the four other `llm-test-*.html` result pages | A | 12 | Structurally aligned |
| Five `model-comparison-phase2-<task>.html` archive pages | B | 14 | Needs normalization: remove three status columns, place text status under rank, retain Evidence |
| `model-comparison-phase2.html` | C | 16 | Valid aggregate metrics, but needs the same status normalization |
| `model-comparison.html` | D | 11 | Accepted legacy rubric |

## Review checklist

Before publication:

1. Select the appropriate format above and document any intentional exception.
2. Compare heading order with the selected format.
3. Confirm every body row has exactly the header's cell count.
4. Confirm status is descriptive text, not `0`, `1`, `true`, or `false`.
5. For Format A, confirm the complete column order: `Rank / status`, `Model`,
   `Public`, `Objective` (or historical `Hidden`), `Functional`, `Reliability`,
   `Maintainability`, `Scope`, `Overall`, `Time (s)`, `Cost`, `Channel`. Record
   any intentional exception before publication.
6. Confirm review criteria are integers and only `Overall` is averaged.
7. Confirm time and cost use their documented units and preserve unknown values.
8. Confirm provider names are not duplicated in the Model and Channel columns.
9. Execute page JavaScript and test sorting, including `N/A` rows.
10. Check the deployed page, not only local HTML.
11. Open every failure/unavailable popover and confirm it is specific to the
    row's sanitized evidence and contains no raw logs or secrets.
