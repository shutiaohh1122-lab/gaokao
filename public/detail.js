const detailCard = document.querySelector("#detailCard");
const params = new URLSearchParams(window.location.search);
const itemId = params.get("id");
const API_BASE = window.location.protocol === "file:" ? "http://127.0.0.1:3002" : "";

function formatDate(value) {
  if (!value) return "未知";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function renderDetail(item, extraction = null) {
  const insight = extraction || {
    summary: item.summary || "暂时没有摘要。可以打开原文查看这条 AI 信号的来源内容。",
    bullets: [item.summary || "这条信号需要进一步查看来源后再深入讨论。"],
    takeaways: [`来自 ${item.source} 的信息信号，热度 ${item.score}，可加入社区观察列表。`],
    excerpts: [],
    warning: "",
    ok: true,
  };

  detailCard.innerHTML = "";

  const meta = document.createElement("div");
  meta.className = "detail-meta";
  meta.innerHTML = `
    <span>热度 ${item.score}</span>
    <span>${item.source} · ${item.sourceType}</span>
    <span>${formatDate(item.publishedAt)}</span>
  `;

  const title = document.createElement("h1");
  title.textContent = item.title;

  const summary = document.createElement("p");
  summary.className = "detail-summary";
  summary.textContent = insight.summary;

  const tags = document.createElement("div");
  tags.className = "detail-tags";
  for (const tag of item.tags || []) {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = tag;
    tags.append(span);
  }

  const actions = document.createElement("div");
  actions.className = "detail-actions";
  actions.innerHTML = `
    <a class="button" href="${item.url}" target="_blank" rel="noreferrer">打开原文</a>
    <button class="button secondary" type="button" id="copyBtn">复制简报</button>
    <button class="button secondary" type="button" id="reloadExtractBtn">刷新解读</button>
  `;

  const insightPanel = document.createElement("section");
  insightPanel.className = "extract-panel";
  insightPanel.innerHTML = `
    <div class="extract-head">
      <div>
        <h2>信息简报</h2>
        <p>${extraction ? "已根据来源内容生成，适合社区阅读、收藏和讨论。" : "正在读取来源内容并生成社区简报..."}</p>
      </div>
      <span class="${insight.ok === false ? "extract-status failed" : "extract-status"}">
        ${extraction ? (insight.ok === false ? "需核对" : "已生成") : "生成中"}
      </span>
    </div>
    ${insight.warning ? `<div class="extract-warning">${insight.warning}</div>` : ""}
    <div class="extract-grid">
      <article>
        <h3>核心信号</h3>
        <ol>${(insight.bullets || []).slice(0, 5).map((point) => `<li>${point}</li>`).join("")}</ol>
      </article>
      <article>
        <h3>讨论角度</h3>
        <ul>${(insight.takeaways || []).map((point) => `<li>${point}</li>`).join("")}</ul>
      </article>
    </div>
    ${(insight.excerpts || []).length ? `
      <div class="excerpt-box">
        <h3>来源片段</h3>
        ${(insight.excerpts || []).slice(0, 4).map((text) => `<p>${text}</p>`).join("")}
      </div>
    ` : ""}
  `;

  const communityPanel = document.createElement("section");
  communityPanel.className = "community-brief-panel";
  communityPanel.innerHTML = `
    <div class="brief-column">
      <h2>社区语境</h2>
      <p>${buildContext(item, insight)}</p>
    </div>
    <div class="brief-column">
      <h2>发起讨论</h2>
      <ul>
        ${buildDiscussionPrompts(item, insight).map((prompt) => `<li>${prompt}</li>`).join("")}
      </ul>
    </div>
  `;

  detailCard.append(meta, title, summary, tags, actions, insightPanel, communityPanel);
  bindActions(item, insight);
}

function bindActions(item, insight) {
  document.querySelector("#copyBtn").addEventListener("click", () => {
    navigator.clipboard.writeText(buildBriefMarkdown(item, insight));
    document.querySelector("#copyBtn").textContent = "已复制";
  });

  document.querySelector("#reloadExtractBtn").addEventListener("click", () => loadExtraction(item, true));
}

function buildBriefMarkdown(item, insight) {
  return [
    `# ${item.title}`,
    "",
    `来源：${item.source}`,
    `时间：${formatDate(item.publishedAt)}`,
    `热度：${item.score}`,
    `链接：${item.url}`,
    "",
    "## 摘要",
    insight.summary || item.summary || "",
    "",
    "## 核心信号",
    ...(insight.bullets || []).map((point) => `- ${point}`),
    "",
    "## 讨论角度",
    ...(insight.takeaways || []).map((point) => `- ${point}`),
  ].join("\n");
}

function buildContext(item, insight) {
  if ((insight.bullets || []).length > 2) {
    return "这条来源信息量较高，适合作为技术讨论、产品观察或模型榜单条目进入社区。";
  }
  if (item.sourceType === "Model Hub") {
    return "这条更适合作为模型观察条目，等待更多评测、使用案例和社区反馈后再提高权重。";
  }
  return "这是一条轻量信息信号，可以保留在信息流中，但深入讨论前建议先核对来源。";
}

function buildDiscussionPrompts(item, insight) {
  const text = `${item.title} ${item.summary} ${(insight.bullets || []).join(" ")}`;
  const prompts = [];
  if (/model|qwen|gpt|claude|gemini|llama|模型/i.test(text)) {
    prompts.push("它和当前主流模型相比，真正的新价值是什么？");
  }
  if (/agent|tool|workflow|product|工具|产品|智能体/i.test(text)) {
    prompts.push("它最适合解决哪类用户或开发者工作流问题？");
  }
  if (/open source|github|开源|developer|社区/i.test(text)) {
    prompts.push("它有机会形成开发者生态，还是只会停留在小众项目？");
  }
  prompts.push("还需要哪些证据，才值得把它推到社区首页？");
  return prompts.slice(0, 3);
}

async function loadExtraction(item, force = false) {
  const button = document.querySelector("#reloadExtractBtn");
  if (button) {
    button.disabled = true;
    button.textContent = "生成中";
  }

  try {
    const response = await fetch(`${API_BASE}/api/extract/${encodeURIComponent(item.id)}${force ? "?refresh=1" : ""}`);
    if (!response.ok) throw new Error(`服务返回 ${response.status}`);
    const data = await response.json();
    renderDetail(data.item || item, data.extraction);
  } catch (error) {
    renderDetail(item, {
      ok: false,
      summary: item.summary || "暂时无法自动生成来源解读。",
      bullets: [item.summary || "暂时无法自动生成来源解读。"],
      takeaways: ["可以先作为社区观察条目保留，深入讨论前建议打开原文核对。"],
      excerpts: [],
      warning: `来源解读失败：${error.message}`,
    });
  }
}

async function loadDetail() {
  if (!itemId) {
    detailCard.innerHTML = '<div class="empty">缺少信息 ID</div>';
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/news`);
    if (!response.ok) throw new Error(`服务返回 ${response.status}`);
    const data = await response.json();
    const item = (data.items || []).find((entry) => entry.id === itemId);
    if (!item) {
      detailCard.innerHTML = '<div class="empty">没有找到这条信息，请返回首页刷新。</div>';
      return;
    }
    renderDetail(item);
    loadExtraction(item);
  } catch (error) {
    detailCard.innerHTML = `<div class="error">加载失败：${error.message}</div>`;
  }
}

loadDetail();
