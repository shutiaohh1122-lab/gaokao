const Parser = require("rss-parser");

const parser = new Parser({
  timeout: 15000,
  headers: {
    "User-Agent": "AI-Curator/1.0 (+local community dashboard)",
  },
});

const COMMUNITY_SOURCES = [
  {
    id: "huggingface-blog",
    name: "Hugging Face Blog",
    type: "Community",
    region: "Global",
    url: "https://huggingface.co/blog/feed.xml",
    tags: ["Hugging Face", "文章", "开源"],
    fetcher: fetchHuggingFaceBlog,
  },
  {
    id: "huggingface-models",
    name: "Hugging Face Models",
    type: "Model Hub",
    region: "Global",
    url: "https://huggingface.co/models",
    tags: ["Hugging Face", "模型", "开源"],
    fetcher: fetchHuggingFaceModels,
  },
  {
    id: "modelscope-models",
    name: "ModelScope 魔搭模型",
    type: "Model Hub",
    region: "CN",
    url: "https://modelscope.cn/models",
    tags: ["ModelScope", "魔搭", "模型"],
    fetcher: fetchModelScopeModels,
  },
  {
    id: "reddit-local-llama",
    name: "Reddit LocalLLaMA",
    type: "Community",
    region: "Global",
    url: "https://www.reddit.com/r/LocalLLaMA/",
    tags: ["Reddit", "LocalLLaMA", "讨论"],
    fetcher: fetchRedditLocalLlama,
  },
  {
    id: "datawhale",
    name: "Datawhale",
    type: "Learning Community",
    region: "CN",
    url: "https://www.datawhale.cn/",
    tags: ["Datawhale", "学习社区", "AI课程"],
    fetcher: fetchDatawhaleLanding,
  },
  {
    id: "liblib",
    name: "LiblibAI 灵感",
    type: "Creative Community",
    region: "CN",
    url: "https://www.liblib.art/inspiration",
    tags: ["Liblib", "AI绘画", "灵感"],
    fetcher: fetchLiblibLanding,
  },
];

const NEWSLETTER_SOURCES = [
  {
    id: "the-rundown-ai",
    name: "The Rundown AI",
    type: "Newsletter",
    region: "Global",
    url: "https://www.therundown.ai/",
    feedUrl: "https://rss.beehiiv.com/feeds/2R3C6Bt5wj.xml",
    tags: ["Newsletter", "每日简报", "AI新闻"],
  },
  {
    id: "bens-bites",
    name: "Ben's Bites",
    type: "Newsletter",
    region: "Global",
    url: "https://www.bensbites.com/",
    feedUrl: "https://www.bensbites.com/feed",
    tags: ["Newsletter", "产品", "创业"],
  },
  {
    id: "latent-press",
    name: "Latent Press",
    type: "Newsletter",
    region: "Global",
    url: "https://latent.press/",
    tags: ["Newsletter", "精选", "AI新闻"],
  },
  {
    id: "aligned-news",
    name: "Aligned News",
    type: "Newsletter",
    region: "Global",
    url: "https://alignednews.ai/",
    tags: ["Newsletter", "研究", "行业"],
  },
  {
    id: "aibase-daily",
    name: "AIBase Daily",
    type: "Newsletter",
    region: "CN",
    url: "https://www.aibase.com/",
    tags: ["中文", "AI工具", "行业"],
  },
  {
    id: "gai-works",
    name: "GAI Works Newsletter",
    type: "Newsletter",
    region: "Global",
    url: "https://gai.works/",
    tags: ["Newsletter", "开发者", "生成式AI"],
  },
  {
    id: "ai-insiders",
    name: "AI Insiders",
    type: "Newsletter",
    region: "Global",
    url: "https://www.aiinsiders.com/",
    tags: ["Newsletter", "投资", "政策"],
  },
  {
    id: "ainewsguru",
    name: "AINewsGuru",
    type: "Newsletter",
    region: "Global",
    url: "https://www.ainewsguru.com/",
    tags: ["Newsletter", "聚合", "AI新闻"],
  },
  {
    id: "contentbuffer",
    name: "ContentBuffer",
    type: "Newsletter",
    region: "Global",
    url: "https://contentbuffer.com/",
    tags: ["Newsletter", "开发工具", "趋势"],
  },
  {
    id: "hushflow-ai",
    name: "HushFlow AI",
    type: "Newsletter",
    region: "Global",
    url: "https://hushflow.com/",
    tags: ["Newsletter", "聚合", "信息源"],
  },
];

const AI_RELEVANCE_PATTERNS = [
  /\bAI\b/i,
  /artificial intelligence/i,
  /machine learning/i,
  /deep learning/i,
  /large language model/i,
  /\bLLM(s)?\b/i,
  /\bagent(s|ic)?\b/i,
  /\bMCP\b/i,
  /\bRAG\b/i,
  /transformer/i,
  /inference/i,
  /multimodal/i,
  /diffusion/i,
  /foundation model/i,
  /alignment/i,
  /benchmark/i,
  /open source/i,
  /Hugging Face/i,
  /Qwen/i,
  /DeepSeek/i,
  /Claude/i,
  /Gemini/i,
  /模型/,
  /开源/,
  /智能体/,
  /多模态/,
  /大模型/,
  /生成/,
  /绘画/,
];

function stripHtml(value = "") {
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function limitText(value = "", max = 280) {
  const clean = stripHtml(value);
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).replace(/\s+\S*$/, "")}...`;
}

function parseDate(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.valueOf()) ? date.toISOString() : null;
}

function hostname(value) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function compactTags(tags = []) {
  return Array.from(
    new Set(
      tags
        .filter(Boolean)
        .map((tag) => String(tag).replace(/^(custom_tag|task|license|library):/i, "").trim())
        .filter(Boolean)
    )
  ).slice(0, 10);
}

function numberLabel(value, fallback = 0) {
  const number = Number(value || fallback);
  return Number.isFinite(number) ? number.toLocaleString("zh-CN") : "0";
}

function scoreItem(item) {
  let score = 24;
  const ageHours = item.publishedAt
    ? (Date.now() - new Date(item.publishedAt).getTime()) / 36e5
    : 168;

  if (ageHours <= 24) score += 35;
  else if (ageHours <= 72) score += 22;
  else if (ageHours <= 168) score += 10;

  if (item.sourceType === "Model Hub") score += 16;
  if (item.sourceType === "Community") score += 12;
  if (item.sourceType === "Newsletter") score += 10;
  if (/release|launch|model|agent|benchmark|open source|multimodal|qwen|deepseek|diffusion|模型|开源|智能体|多模态/i.test(`${item.title} ${item.summary}`)) {
    score += 14;
  }
  if (item.points) score += Math.min(24, Math.round(item.points / 8));

  return Math.max(0, Math.min(100, score));
}

function normalizeItem(raw) {
  const item = {
    id: raw.id || raw.url,
    title: stripHtml(raw.title || "Untitled"),
    source: raw.source,
    sourceType: raw.type,
    region: raw.region,
    url: raw.url,
    domain: hostname(raw.url),
    publishedAt: parseDate(raw.publishedAt),
    summary: limitText(raw.summary || raw.content || ""),
    tags: compactTags(raw.tags || []),
    points: Number(raw.points || 0),
  };
  item.score = scoreItem(item);
  return item;
}

function isAiRelevant(item) {
  const text = `${item.title} ${item.summary} ${item.url} ${item.tags.join(" ")}`;
  return AI_RELEVANCE_PATTERNS.some((pattern) => pattern.test(text));
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "AI-Curator/1.0 (+local community dashboard)",
      ...(options.headers || {}),
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": "AI-Curator/1.0 (+local community dashboard)",
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

async function fetchHuggingFaceBlog(source) {
  const feed = await parser.parseURL(source.url);
  return (feed.items || []).slice(0, 16).map((item) =>
    normalizeItem({
      id: item.guid || item.link,
      title: item.title,
      source: source.name,
      type: source.type,
      region: source.region,
      url: item.link,
      publishedAt: item.isoDate || item.pubDate,
      summary: item.contentSnippet || item.summary || item.content,
      tags: source.tags.concat(item.categories || []),
    })
  );
}

async function fetchHuggingFaceModels(source) {
  const [latest, active, popular] = await Promise.all([
    fetchJson("https://huggingface.co/api/models?sort=createdAt&limit=12"),
    fetchJson("https://huggingface.co/api/models?sort=lastModified&limit=12"),
    fetchJson("https://huggingface.co/api/models?sort=downloads&limit=8"),
  ]);

  return latest
    .concat(active, popular)
    .filter((model) => model.modelId || model.id)
    .map((model) => {
      const modelId = model.modelId || model.id;
      return normalizeItem({
        id: `hf-model:${modelId}:${model.lastModified || model.createdAt || ""}`,
        title: modelId,
        source: source.name,
        type: source.type,
        region: source.region,
        url: `https://huggingface.co/${modelId}`,
        publishedAt: model.lastModified || model.createdAt,
        summary: [
          model.pipeline_tag ? `任务：${model.pipeline_tag}` : "",
          model.library_name ? `库：${model.library_name}` : "",
          `下载：${numberLabel(model.downloads)}`,
          `点赞：${numberLabel(model.likes)}`,
        ].filter(Boolean).join("；"),
        tags: source.tags.concat(model.tags || []),
        points: Number(model.likes || 0) + Math.min(120, Math.round(Number(model.downloads || 0) / 1000000)),
      });
    })
    .filter(isAiRelevant);
}

async function fetchModelScopeModels(source) {
  const data = await fetchJson("https://modelscope.cn/openapi/v1/models?page_number=1&page_size=20");
  const models = data && data.data && Array.isArray(data.data.models) ? data.data.models : [];

  return models.map((model) =>
    normalizeItem({
      id: `modelscope:${model.id}:${model.last_modified || model.created_at || ""}`,
      title: model.display_name || model.id,
      source: source.name,
      type: source.type,
      region: source.region,
      url: `https://modelscope.cn/models/${model.id}`,
      publishedAt: model.last_modified || model.created_at,
      summary: [
        model.description,
        model.tasks && model.tasks.length ? `任务：${model.tasks.join(", ")}` : "",
        `下载：${numberLabel(model.downloads)}`,
        `点赞：${numberLabel(model.likes)}`,
        model.license ? `协议：${model.license}` : "",
      ].filter(Boolean).join("；"),
      tags: source.tags.concat(model.tags || [], model.tasks || []),
      points: Number(model.likes || 0) + Math.min(80, Math.round(Number(model.downloads || 0) / 1000)),
    })
  );
}

async function fetchRedditLocalLlama(source) {
  const feed = await parser.parseURL("https://www.reddit.com/r/LocalLLaMA/.rss");
  return (feed.items || []).slice(0, 20).map((item) =>
    normalizeItem({
      id: item.guid || item.link,
      title: item.title,
      source: source.name,
      type: source.type,
      region: source.region,
      url: item.link,
      publishedAt: item.isoDate || item.pubDate,
      summary: item.contentSnippet || item.summary || item.content,
      tags: source.tags.concat(item.categories || []),
      points: 0,
    })
  ).filter(isAiRelevant);
}

async function fetchDatawhaleLanding(source) {
  const html = await fetchText(source.url);
  const description = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
  return [
    normalizeItem({
      id: "datawhale:landing",
      title: "Datawhale AI 学习社区",
      source: source.name,
      type: source.type,
      region: source.region,
      url: source.url,
      publishedAt: new Date().toISOString(),
      summary: description ? description[1] : "Datawhale AI 开源学习社区，可作为课程、活动、学习路线来源。",
      tags: source.tags,
      points: 0,
    }),
  ];
}

async function fetchLiblibLanding(source) {
  const html = await fetchText(source.url);
  const title = html.match(/<title>([^<]+)<\/title>/i);
  const description = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
  return [
    normalizeItem({
      id: "liblib:inspiration",
      title: title ? title[1] : "LiblibAI 灵感广场",
      source: source.name,
      type: source.type,
      region: source.region,
      url: source.url,
      publishedAt: new Date().toISOString(),
      summary: description ? description[1] : "LiblibAI AI 绘画与模型创作社区，可作为灵感和视觉趋势来源。",
      tags: source.tags,
      points: 0,
    }),
  ];
}

async function fetchNewsletterSource(source) {
  if (source.feedUrl) {
    const feed = await parser.parseURL(source.feedUrl);
    const items = (feed.items || []).slice(0, 10).map((item) =>
      normalizeItem({
        id: item.guid || item.link || `${source.id}:${item.title}`,
        title: item.title,
        source: source.name,
        type: source.type,
        region: source.region,
        url: item.link || source.url,
        publishedAt: item.isoDate || item.pubDate,
        summary: item.contentSnippet || item.summary || item.content,
        tags: source.tags.concat(item.categories || []),
        points: 0,
      })
    );
    if (items.length) return items.filter(isAiRelevant);
  }

  const html = await fetchText(source.url);
  const title = html.match(/<title>([^<]+)<\/title>/i);
  const description = html.match(/<meta\s+(?:name|property)="(?:description|og:description)"\s+content="([^"]+)"/i);
  return [
    normalizeItem({
      id: `newsletter:${source.id}`,
      title: title ? title[1] : source.name,
      source: source.name,
      type: source.type,
      region: source.region,
      url: source.url,
      publishedAt: new Date().toISOString(),
      summary: description ? description[1] : `${source.name} 是参考帖推荐的 AI 资讯源，暂未发现稳定公开 RSS，先作为可追溯来源接入。`,
      tags: source.tags,
      points: 0,
    }),
  ];
}

function dedupe(items) {
  const seen = new Map();
  for (const item of items) {
    const key = (item.url || item.title).toLowerCase().replace(/[?#].*$/, "");
    const existing = seen.get(key);
    if (!existing || item.score > existing.score) {
      seen.set(key, item);
    }
  }
  return Array.from(seen.values());
}

async function collectNews() {
  const startedAt = new Date().toISOString();
  const jobs = COMMUNITY_SOURCES.map((source) => ({
    ...source,
    run: () => source.fetcher(source),
  })).concat(
    NEWSLETTER_SOURCES.map((source) => ({
      ...source,
      run: () => fetchNewsletterSource(source),
    }))
  );

  const settled = await Promise.allSettled(jobs.map((job) => job.run()));

  const sourceStatus = settled.map((result, index) => ({
    id: jobs[index].id,
    name: jobs[index].name,
    ok: result.status === "fulfilled",
    count: result.status === "fulfilled" ? result.value.length : 0,
    error: result.status === "rejected" ? result.reason.message : "",
  }));

  const items = dedupe(
    settled.flatMap((result) => (result.status === "fulfilled" ? result.value : []))
  ).sort((a, b) => {
    const dateDiff = new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0);
    return dateDiff || b.score - a.score;
  });

  return {
    generatedAt: new Date().toISOString(),
    startedAt,
    total: items.length,
    sourceStatus,
    newsletterSources: NEWSLETTER_SOURCES.map(({ id, name, type, region, url, tags }) => ({
      id,
      name,
      type,
      region,
      url,
      tags,
    })),
    items,
  };
}

module.exports = {
  collectNews,
  COMMUNITY_SOURCES,
  NEWSLETTER_SOURCES,
};
