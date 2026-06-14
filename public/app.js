const state = {
  items: [],
  sources: [],
  referenceSources: [],
  activeChannel: "all",
  generatedAt: null,
};

const API_BASE = window.location.protocol === "file:" ? "http://127.0.0.1:3002" : "";

const headlineGrid = document.querySelector("#headlineGrid");
const productList = document.querySelector("#productList");
const communityList = document.querySelector("#communityList");
const modelList = document.querySelector("#modelList");
const startupList = document.querySelector("#startupList");
const sourceList = document.querySelector("#sourceList");
const referenceList = document.querySelector("#referenceList");
const topList = document.querySelector("#topList");
const channelTabs = document.querySelector("#channelTabs");
const errorBox = document.querySelector("#errorBox");
const storyTemplate = document.querySelector("#storyTemplate");
const searchInput = document.querySelector("#searchInput");
const typeFilter = document.querySelector("#typeFilter");
const dateFilter = document.querySelector("#dateFilter");
const refreshBtn = document.querySelector("#refreshBtn");
const exportBtn = document.querySelector("#exportBtn");
const subscribeForm = document.querySelector("#subscribeForm");
const subscribeNote = document.querySelector("#subscribeNote");

const CHANNELS = [
  { id: "all", label: "全部" },
  { id: "products", label: "产品" },
  { id: "models", label: "模型" },
  { id: "community", label: "社区" },
  { id: "startups", label: "创业" },
  { id: "china", label: "中文" },
];

function formatDate(value) {
  if (!value) return "未知";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function ageInDays(value) {
  if (!value) return Infinity;
  return (Date.now() - new Date(value).getTime()) / 864e5;
}

function detailUrl(item) {
  return `./detail.html?id=${encodeURIComponent(item.id)}`;
}

function applyDetailLink(element, item) {
  const href = detailUrl(item);
  element.href = href;
  element.setAttribute("data-href", href);
  element.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.assign(href);
  });
}

function setLoading(isLoading) {
  refreshBtn.disabled = isLoading;
  refreshBtn.textContent = isLoading ? "同步中" : "刷新";
}

function populateTypeFilter() {
  const current = typeFilter.value;
  const types = Array.from(new Set(state.items.map((item) => item.sourceType))).sort();
  typeFilter.innerHTML = '<option value="">全部类型</option>';
  for (const type of types) {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    typeFilter.append(option);
  }
  typeFilter.value = current;
}

function filteredItems() {
  const keyword = searchInput.value.trim().toLowerCase();
  const type = typeFilter.value;
  const days = Number(dateFilter.value || 0);

  return state.items
    .filter((item) => {
      const text = `${item.title} ${item.summary} ${item.source} ${item.tags.join(" ")}`.toLowerCase();
      return !keyword || text.includes(keyword);
    })
    .filter((item) => !type || item.sourceType === type)
    .filter((item) => !days || ageInDays(item.publishedAt) <= days)
    .filter((item) => matchesChannel(item, state.activeChannel))
    .sort((a, b) => b.score - a.score || new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
}

function matchesChannel(item, channel) {
  const text = `${item.source} ${item.title} ${item.summary} ${item.tags.join(" ")}`;
  if (channel === "all") return true;
  if (channel === "products") return /tool|product|launch|builder|创业|产品|工具|应用/i.test(text) || item.sourceType === "Newsletter";
  if (channel === "models") return item.sourceType === "Model Hub" || /model|qwen|gpt|claude|gemini|llama|deepseek|模型/i.test(text);
  if (channel === "community") return /community|discussion|reddit|blog|developer|开源|社区|技术/i.test(text) || item.sourceType === "Community";
  if (channel === "startups") return /funding|startup|raise|venture|invest|融资|创业|投资/i.test(text);
  if (channel === "china") return item.region === "CN";
  return true;
}

function renderChannels() {
  channelTabs.innerHTML = "";
  for (const channel of CHANNELS) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `channel-tab${state.activeChannel === channel.id ? " active" : ""}`;
    button.innerHTML = `<span>${channel.label}</span><strong>${countChannel(channel.id)}</strong>`;
    button.addEventListener("click", () => {
      state.activeChannel = channel.id;
      renderChannels();
      renderSections();
    });
    channelTabs.append(button);
  }
}

function countChannel(channel) {
  return state.items.filter((item) => matchesChannel(item, channel)).length;
}

function createStoryCard(item, variant = "") {
  const node = storyTemplate.content.cloneNode(true);
  const card = node.querySelector(".story-card");
  card.className = `story-card ${variant}`.trim();
  applyDetailLink(card, item);
  card.style.setProperty("--card-accent", accentForSource(item.source));
  node.querySelector(".story-kicker").textContent = `${coverLabel(item)} · ${item.source}`;
  node.querySelector("h3").textContent = item.title;
  node.querySelector("p").textContent = item.summary || "进入详情查看信息简报、讨论线索和来源片段。";
  node.querySelector(".score").textContent = item.score;
  node.querySelector(".source").textContent = item.sourceType;
  node.querySelector(".date").textContent = formatDate(item.publishedAt);
  return node;
}

function renderSections() {
  const items = filteredItems();
  document.querySelector("#visibleCount").textContent = `${items.length} 条可见信号`;
  renderTopNews(items);
  renderHeadlines(items);
  renderProducts(items);
  renderCommunity(items);
  renderModels(items);
  renderStartups(items);
}

function renderHeadlines(items) {
  headlineGrid.innerHTML = "";
  const top = items.slice(0, 6);
  if (!top.length) {
    renderEmpty(headlineGrid, "暂无匹配信号");
    return;
  }
  for (const [index, item] of top.entries()) {
    headlineGrid.append(createStoryCard(item, index === 0 ? "featured" : ""));
  }
}

function renderProducts(items) {
  const productItems = pickItems(items, (item) => matchesChannel(item, "products"), 6);
  productList.innerHTML = "";
  for (const [index, item] of productItems.entries()) {
    const row = document.createElement("a");
    row.className = "product-row";
    applyDetailLink(row, item);
    row.innerHTML = `
      <span class="product-rank">${index + 1}</span>
      <span class="product-icon">${initials(item.source)}</span>
      <span class="product-copy">
        <strong>${item.title}</strong>
        <em>${item.summary || item.source}</em>
      </span>
      <span class="upvote">${item.score}</span>
    `;
    productList.append(row);
  }
  if (!productItems.length) renderEmpty(productList, "暂无产品动态");
}

function renderCommunity(items) {
  communityList.innerHTML = "";
  const communityItems = pickItems(items, (item) => matchesChannel(item, "community"), 5);
  for (const item of communityItems) {
    const link = document.createElement("a");
    link.className = "discussion-row";
    applyDetailLink(link, item);
    link.innerHTML = `
      <span class="discussion-dot"></span>
      <span>
        <strong>${item.title}</strong>
        <em>${item.source} · ${formatDate(item.publishedAt)}</em>
      </span>
    `;
    communityList.append(link);
  }
  if (!communityItems.length) renderEmpty(communityList, "暂无社区讨论");
}

function renderModels(items) {
  const modelItems = pickItems(items, (item) => matchesChannel(item, "models"), 7);
  modelList.innerHTML = "";
  for (const [index, item] of modelItems.entries()) {
    const link = document.createElement("a");
    link.className = "model-row";
    applyDetailLink(link, item);
    link.innerHTML = `
      <span class="model-rank">#${index + 1}</span>
      <span>
        <strong>${cleanModelName(item.title)}</strong>
        <em>${item.source} · ${item.summary || "模型信息信号"}</em>
      </span>
      <span class="model-heat">${item.score}</span>
    `;
    modelList.append(link);
  }
  if (!modelItems.length) renderEmpty(modelList, "暂无模型动态");
}

function renderStartups(items) {
  startupList.innerHTML = "";
  const startupItems = pickItems(items, (item) => matchesChannel(item, "startups"), 4);
  const fallback = startupItems.length ? startupItems : items.filter((item) => item.sourceType === "Newsletter").slice(0, 4);
  for (const item of fallback) {
    startupList.append(createStoryCard(item, "compact"));
  }
  if (!fallback.length) renderEmpty(startupList, "暂无行业动态");
}

function renderTopNews(items) {
  topList.innerHTML = "";
  const topItems = items.slice().sort((a, b) => b.score - a.score).slice(0, 10);

  for (const [index, item] of topItems.entries()) {
    const link = document.createElement("a");
    link.className = "top-row";
    applyDetailLink(link, item);
    link.innerHTML = `
      <span class="rank">${index + 1}</span>
      <span class="top-copy">
        <strong>${item.title}</strong>
        <em>${item.source}</em>
      </span>
      <span class="top-score">${item.score}</span>
    `;
    topList.append(link);
  }
}

function renderSources() {
  sourceList.innerHTML = "";
  for (const source of state.sources.slice(0, 12)) {
    const row = document.createElement("div");
    row.className = `source-row${source.ok ? "" : " failed"}`;
    row.innerHTML = `
      <strong>${source.name}</strong>
      <span>${source.ok ? "在线" : source.error || "失败"}</span>
      <div class="status">${source.ok ? `${source.count}` : "!"}</div>
    `;
    sourceList.append(row);
  }
}

function renderReferenceSources() {
  referenceList.innerHTML = "";
  for (const name of state.referenceSources) {
    const span = document.createElement("span");
    span.className = "reference-pill";
    span.textContent = name;
    referenceList.append(span);
  }
}

function renderStats() {
  document.querySelector("#totalCount").textContent = state.items.length;
  document.querySelector("#sourceCount").textContent = state.sources.filter((source) => source.ok).length;
  document.querySelector("#modelCount").textContent = state.items.filter((item) => matchesChannel(item, "models")).length;
  document.querySelector("#updatedAt").textContent = state.generatedAt ? formatDate(state.generatedAt) : "--";
}

function pickItems(items, predicate, limit) {
  return items.filter(predicate).slice(0, limit);
}

function renderEmpty(container, text) {
  const empty = document.createElement("div");
  empty.className = "empty";
  empty.textContent = text;
  container.append(empty);
}

function accentForSource(source = "") {
  if (source.includes("ModelScope")) return "#7dd3fc";
  if (source.includes("Hugging Face")) return "#8fffe0";
  if (source.includes("Datawhale")) return "#9dffb0";
  if (source.includes("Liblib")) return "#ff7f69";
  if (source.includes("Reddit")) return "#ffd166";
  return "#86a8ff";
}

function coverLabel(item) {
  if (item.sourceType === "Model Hub") return "模型";
  if (item.sourceType === "Newsletter") return "资讯";
  if (item.sourceType === "Creative Community") return "创作";
  if (item.sourceType === "Learning Community") return "学习";
  return "社区";
}

function initials(value = "") {
  return value
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "AI";
}

function cleanModelName(title = "") {
  return title.split("/").pop() || title;
}

function render() {
  populateTypeFilter();
  renderChannels();
  renderSources();
  renderReferenceSources();
  renderStats();
  renderSections();
}

async function loadNews(force = false) {
  setLoading(true);
  errorBox.hidden = true;
  try {
    const response = await fetch(`${API_BASE}/api/news${force ? "?refresh=1" : ""}`);
    if (!response.ok) throw new Error(`服务返回 ${response.status}`);
    const data = await response.json();
    state.items = data.items || [];
    state.sources = data.sourceStatus || [];
    state.referenceSources = (data.newsletterSources || []).map((source) => source.name);
    state.generatedAt = data.generatedAt;
    render();
  } catch (error) {
    errorBox.hidden = false;
    errorBox.textContent = `同步失败：${error.message}`;
  } finally {
    setLoading(false);
  }
}

function exportMarkdown() {
  const items = filteredItems();
  const lines = [
    `# 星环 AI 社区信号 ${new Date().toLocaleDateString("zh-CN")}`,
    "",
    ...items.slice(0, 30).flatMap((item, index) => [
      `## ${index + 1}. ${item.title}`,
      "",
      `- 来源：${item.source} (${item.sourceType})`,
      `- 时间：${item.publishedAt ? new Date(item.publishedAt).toLocaleString("zh-CN") : "未知"}`,
      `- 热度：${item.score}`,
      `- 链接：${item.url}`,
      `- 摘要：${item.summary || "暂无摘要"}`,
      "",
    ]),
  ];
  navigator.clipboard.writeText(lines.join("\n"));
  exportBtn.textContent = "已复制";
  window.setTimeout(() => {
    exportBtn.textContent = "导出";
  }, 1400);
}

for (const input of [searchInput, typeFilter, dateFilter]) {
  input.addEventListener("input", renderSections);
}

refreshBtn.addEventListener("click", () => loadNews(true));
exportBtn.addEventListener("click", exportMarkdown);

subscribeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  subscribeNote.textContent = "你已加入星环 AI 社区内测名单。";
  subscribeForm.reset();
});

loadNews();
