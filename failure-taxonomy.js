(() => {
  const taxonomy = [
    {
      match: /^(success|completed|\d+\/\d+ completed)$/,
      label: "Completed",
      description:
        "The agent completed the task and the public test command passed.",
    },
    {
      match: /^(tests[_ ]failed|test failure)$/,
      label: "Tests failed",
      description:
        "The agent produced a patch, but the public test command did not pass.",
    },
    {
      match: /^(objective[_ ]failed|evaluated failure)$/,
      label: "Objective failed",
      description:
        "Public tests passed, but the separate objective or hidden evaluator found incorrect behavior.",
    },
    {
      match: /^forbidden[_ ]changes$/,
      label: "Forbidden changes",
      description:
        "The solution changed files outside the task's allowed change boundary.",
    },
    {
      match: /^(agent[_ ]failure|timeout)$/,
      label: "Agent failure",
      description:
        "The agent did not finish correctly because of a timeout, process failure, or another runtime error.",
    },
    {
      match: /^agent (error|failure).*(partial patch|no patch)$/,
      label: "Agent failure",
      description:
        "The agent session failed or timed out. Any preserved partial patch is tested and scored separately; no patch remains N/A.",
    },
    {
      match: /^(unavailable|provider error)$/,
      label: "Unavailable",
      description:
        "The model route failed preflight and did not receive the benchmark task.",
    },
    {
      match: /^no[_ ]patch$/,
      label: "No patch",
      description:
        "The run produced no usable code change, so code-quality scores remain N/A.",
    },
  ];

  const style = document.createElement("style");
  style.textContent = `
    .failure-info{position:relative;display:inline-flex;margin:4px 0 0 5px;vertical-align:top}
    .failure-info-button{display:grid;place-items:center;width:19px;height:19px;padding:0;border:1px solid #78909c88;border-radius:50%;background:#fff;color:#455a64;font:800 12px/1 system-ui;cursor:pointer}
    .failure-info-button:hover,.failure-info-button:focus-visible{border-color:#33691e;color:#33691e;outline:2px solid #aed58166;outline-offset:1px}
    .failure-info-popover{position:absolute;z-index:20;left:0;top:25px;width:min(290px,75vw);padding:10px 12px;border:1px solid #aed581;border-radius:10px;background:#fff;color:#263238;box-shadow:0 8px 24px #26323826;font:400 .78rem/1.45 system-ui;text-align:left;white-space:normal}
    .failure-info-popover strong{display:block;margin-bottom:3px}
  `;
  document.head.appendChild(style);

  function closeAll(except = null) {
    document.querySelectorAll(".failure-info-popover").forEach((popover) => {
      if (popover !== except) popover.hidden = true;
    });
  }

  document.querySelectorAll("tbody .badge").forEach((badge) => {
    const status = badge.textContent.trim().toLowerCase();
    const item = taxonomy.find(({ match }) => match.test(status));
    if (!item || badge.nextElementSibling?.classList.contains("failure-info"))
      return;

    const holder = document.createElement("span");
    holder.className = "failure-info";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "failure-info-button";
    button.textContent = "i";
    button.setAttribute("aria-label", `Explain status: ${item.label}`);
    button.setAttribute("aria-expanded", "false");
    const popover = document.createElement("span");
    popover.className = "failure-info-popover";
    popover.hidden = true;
    const title = document.createElement("strong");
    title.textContent = item.label;
    const description = document.createElement("span");
    // A results table may add a model-specific explanation from its sanitized
    // public artifact.  Keep the taxonomy text as a fallback, but never reduce
    // a concrete failure to an opaque process-status code.
    const detail = badge.dataset.failureDetail?.trim();
    description.textContent = detail || item.description;
    popover.append(title, description);
    holder.append(button, popover);
    badge.after(holder);

    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const opening = popover.hidden;
      closeAll(popover);
      popover.hidden = !opening;
      button.setAttribute("aria-expanded", String(opening));
    });
  });

  document.addEventListener("click", () => closeAll());
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeAll();
  });
})();
