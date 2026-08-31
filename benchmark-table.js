(() => {
  "use strict";

  const missing = (value) => value === null || value === undefined;
  const escapeHtml = (value) =>
    String(value).replace(
      /[&<>'"]/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        })[character],
    );
  const mean = (values) =>
    Array.isArray(values) && values.length
      ? values.reduce((total, value) => total + value, 0) / values.length
      : null;
  const compact = (value) => Number(Number(value).toFixed(2)).toString();
  const statusOrder = {
    success: 0,
    completed: 0,
    tests_failed: 1,
    objective_failed: 2,
    forbidden_changes: 3,
    agent_failure: 4,
    unavailable: 5,
  };

  const columns = [
    { key: "rank", label: "Rank / status", type: "number" },
    { key: "label", label: "Model", type: "text" },
    { key: "public", label: "Public", type: "text" },
    { key: "objective", label: "Objective", type: "text" },
    { key: "functional", label: "Functional", type: "number", className: "score-head" },
    { key: "reliability", label: "Reliability", type: "number", className: "score-head" },
    { key: "maintainability", label: "Maintainability", type: "number", className: "score-head" },
    { key: "scope", label: "Scope", type: "number", className: "score-head" },
    { key: "overall", label: "Overall", type: "number", className: "score-head" },
    { key: "time", label: "Time (s)", type: "number" },
    { key: "cost", label: "Cost", type: "number" },
    { key: "channel", label: "Channel", type: "text" },
  ];

  function normalizeRows(inputRows) {
    return inputRows.map((input, index) => {
      const scores = Array.isArray(input.scores) ? input.scores : [];
      return {
        ...input,
        status: input.status || "completed",
        objective: input.objective ?? input.hidden ?? null,
        functional: scores[0] ?? input.functional ?? null,
        reliability: scores[1] ?? input.reliability ?? null,
        maintainability: scores[2] ?? input.maintainability ?? null,
        scope: scores[3] ?? input.scope ?? null,
        overall: input.overall ?? mean(scores),
        originalIndex: index,
      };
    });
  }

  function canonicalCompare(a, b) {
    return (
      (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9) ||
      (b.overall ?? -1) - (a.overall ?? -1) ||
      (a.time ?? Infinity) - (b.time ?? Infinity) ||
      (a.cost ?? Infinity) - (b.cost ?? Infinity) ||
      a.originalIndex - b.originalIndex
    );
  }

  function assignRanks(rows) {
    let rank = 0;
    [...rows].sort(canonicalCompare).forEach((row) => {
      row.rank = row.status === "unavailable" ? null : ++rank;
    });
  }

  const na = '<span class="na">N/A</span>';
  const scoreMarkup = (value) => (missing(value) ? na : compact(value));
  const resultMarkup = (value, detail = "") =>
    missing(value)
      ? na
      : `<span class="badge result-badge ${escapeHtml(String(value).toLowerCase())}"${
          detail ? ` data-failure-detail="${escapeHtml(detail)}"` : ""
        }>${escapeHtml(value)}</span>`;

  function rowMarkup(row) {
    const successful = row.status === "success" || row.status === "completed";
    const detail = row.failureDetail || "";
    return `<tr>
      <td>${missing(row.rank) ? na : `<strong>#${row.rank}</strong>`}<span class="badge${successful ? " success" : ""}"${detail ? ` data-failure-detail="${escapeHtml(detail)}"` : ""}>${escapeHtml(row.status)}</span></td>
      <td><span class="model">${escapeHtml(row.label)}</span><span class="candidate-id">${escapeHtml(row.id)}</span></td>
      <td class="score">${resultMarkup(row.public, row.public === "Fail" ? detail : "")}</td>
      <td class="score">${resultMarkup(row.objective, row.objective === "Fail" ? detail : "")}</td>
      <td class="score">${scoreMarkup(row.functional)}</td>
      <td class="score">${scoreMarkup(row.reliability)}</td>
      <td class="score">${scoreMarkup(row.maintainability)}</td>
      <td class="score">${scoreMarkup(row.scope)}</td>
      <td class="score overall">${scoreMarkup(row.overall)}</td>
      <td class="number">${missing(row.time) ? na : Number(row.time).toFixed(3)}</td>
      <td class="number">${missing(row.cost) ? na : `$${row.cost}`}</td>
      <td class="channel">${escapeHtml(row.channel ?? "")}</td>
    </tr>`;
  }

  function tableMarkup(data) {
    const labels = { objective: data.objectiveLabel || "Objective" };
    return `<div class="table-tools">
      <div>
        <h2>${escapeHtml(data.title || "Complete candidate results")}</h2>
        <p>${escapeHtml(data.help || "Click a heading to sort. N/A values remain last.")}</p>
      </div>
      <p><span data-row-count>${data.rows.length}</span> rows</p>
    </div>
    <div class="table-scroll" role="region" aria-label="${escapeHtml(data.ariaLabel || "Sortable model comparison table")}" tabindex="0">
      <table>
        <caption>${escapeHtml(data.caption || "Benchmark results")}</caption>
        <thead><tr>${columns
          .map((column) => `<th${column.className ? ` class="${column.className}"` : ""} scope="col" aria-sort="none"><button type="button" data-key="${column.key}" data-type="${column.type}">${escapeHtml(labels[column.key] || column.label)} <span class="sort-indicator" aria-hidden="true">↕</span></button></th>`)
          .join("")}</tr></thead>
        <tbody></tbody>
      </table>
    </div>`;
  }

  async function mount(container) {
    const response = await fetch(container.dataset.results);
    if (!response.ok) throw new Error(`Unable to load ${container.dataset.results}: HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data.rows)) throw new TypeError("Benchmark table JSON must contain a rows array");
    const rows = normalizeRows(data.rows);
    assignRanks(rows);
    container.innerHTML = tableMarkup({ ...data, rows });
    const body = container.querySelector("tbody");
    const headers = [...container.querySelectorAll("th")];
    const state = { key: "overall", direction: "descending", type: "number" };

    const compare = (a, b) => {
      if (state.key === "overall" && state.direction === "descending") return canonicalCompare(a, b);
      const av = a[state.key];
      const bv = b[state.key];
      if (missing(av) !== missing(bv)) return missing(av) ? 1 : -1;
      if (missing(av)) return a.originalIndex - b.originalIndex;
      const result = state.type === "number"
        ? Number(av) - Number(bv)
        : String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: "base" });
      return (state.direction === "descending" ? -result : result) || a.originalIndex - b.originalIndex;
    };
    const render = () => {
      body.innerHTML = [...rows].sort(compare).map(rowMarkup).join("");
      document.dispatchEvent(new CustomEvent("benchmark-table:rendered", { detail: { container, rows } }));
    };
    const updateHeaders = (activeButton) => {
      headers.forEach((header) => {
        const button = header.querySelector("button");
        const active = button === activeButton;
        header.setAttribute("aria-sort", active ? state.direction : "none");
        button.querySelector(".sort-indicator").textContent = active
          ? state.direction === "ascending" ? "▲" : "▼"
          : "↕";
      });
    };
    container.querySelectorAll("th button").forEach((button) => {
      button.addEventListener("click", () => {
        if (state.key === button.dataset.key) {
          state.direction = state.direction === "ascending" ? "descending" : "ascending";
        } else {
          state.key = button.dataset.key;
          state.type = button.dataset.type;
          state.direction = "ascending";
        }
        updateHeaders(button);
        render();
      });
    });
    const initial = container.querySelector('[data-key="overall"]');
    updateHeaders(initial);
    render();
  }

  async function init() {
    const containers = [...document.querySelectorAll("[data-benchmark-table][data-results]")];
    await Promise.all(containers.map((container) => mount(container).catch((error) => {
      container.innerHTML = `<p class="table-error" role="alert">${escapeHtml(error.message)}</p>`;
      console.error(error);
    })));
  }

  globalThis.BenchmarkTable = { init, mount };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
