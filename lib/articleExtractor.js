const MAX_HTML_BYTES = 2_000_000;
const MIN_PARAGRAPH_LENGTH = 28;

const STOP_PATTERNS = [
  /cookie/i,
  /privacy policy/i,
  /subscribe/i,
  /sign in/i,
  /sign up/i,
  /all rights reserved/i,
  /back to articles/i,
  /update on github/i,
  /^upvote\s+\d+/i,
  /版权所有/,
  /登录/,
  /注册/,
  /订阅/,
  /隐私/,
];

const AI_KEYWORDS = [
  "AI",
  "model",
  "models",
  "agent",
  "agents",
  "LLM",
  "benchmark",
  "open source",
  "multimodal",
  "inference",
  "training",
  "dataset",
  "模型",
  "智能体",
  "多模态",
  "开源",
  "推理",
  "训练",
  "数据集",
  "生成",
  "工具",
  "产品",
  "研究",
];

function decodeEntities(value = "") {
  return String(value)
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([a-f0-9]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function cleanText(value = "") {
  return decodeEntities(value)
    .replace(/\s+/g, " ")
    .replace(/\u00a0/g, " ")
    .trim();
}

function stripTags(value = "") {
  return cleanText(String(value).replace(/<[^>]*>/g, " "));
}

function limitText(value = "", max = 520) {
  const clean = cleanText(value);
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).replace(/\s+\S*$/, "")}...`;
}

function unique(values) {
  const seen = new Set();
  return values.filter((value) => {
    const key = value.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function extractMeta(html, name) {
  const pattern = new RegExp(
    `<meta\\s+(?:name|property)=["']${name}["']\\s+content=["']([^"']+)["'][^>]*>|<meta\\s+content=["']([^"']+)["']\\s+(?:name|property)=["']${name}["'][^>]*>`,
    "i"
  );
  const match = html.match(pattern);
  return cleanText(match && (match[1] || match[2] || ""));
}

function pruneHtml(html) {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<aside[\s\S]*?<\/aside>/gi, " ")
    .replace(/<form[\s\S]*?<\/form>/gi, " ");
}

function extractBlocks(html) {
  const pruned = pruneHtml(html);
  const blocks = [];
  const pattern = /<(h[1-3]|p|li|blockquote)[^>]*>([\s\S]*?)<\/\1>/gi;
  let match;

  while ((match = pattern.exec(pruned))) {
    const text = stripTags(match[2]);
    if (!text || text.length < MIN_PARAGRAPH_LENGTH) continue;
    if (STOP_PATTERNS.some((pattern) => pattern.test(text))) continue;
    blocks.push(text);
  }

  return unique(blocks).slice(0, 90);
}

function splitSentences(blocks) {
  return blocks.flatMap((block) => {
    if (/[\u4e00-\u9fff]/.test(block)) {
      return block
        .split(/(?<=[。！？；])/)
        .map(cleanText)
        .filter((sentence) => sentence.length >= 18);
    }
    return block
      .split(/(?<=[.!?;])\s+/)
      .map(cleanText)
      .filter((sentence) => sentence.length >= 45);
  });
}

function scoreSentence(sentence, item) {
  const text = sentence.toLowerCase();
  const titleTokens = String(item.title || "")
    .toLowerCase()
    .split(/[^\p{L}\p{N}\u4e00-\u9fff]+/u)
    .filter((token) => token.length >= 2);
  let score = 0;

  for (const keyword of AI_KEYWORDS) {
    if (text.includes(keyword.toLowerCase())) score += 3;
  }
  for (const token of titleTokens) {
    if (text.includes(token)) score += 2;
  }
  if (sentence.length >= 80 && sentence.length <= 220) score += 5;
  if (/\d|%|倍|million|billion|参数|tokens?|benchmark/i.test(sentence)) score += 4;
  if (/release|launch|announce|开源|发布|推出|更新|支持|提升|超过/i.test(sentence)) score += 4;
  if (sentence.length > 320) score -= 4;

  return score;
}

function buildBullets(blocks, item) {
  const sentences = unique(splitSentences(blocks));
  const early = sentences
    .slice(0, 12)
    .filter((sentence) => /tl;?dr|we explain|introduce|announce|release|launch|本文|发布|推出|介绍|说明|核心|重点/i.test(sentence))
    .map((sentence) => limitText(sentence.replace(/^TL;DR:\s*/i, ""), 180));
  const scored = sentences
    .map((sentence) => ({
      sentence: limitText(sentence, 180),
      score: scoreSentence(sentence, item),
    }))
    .sort((a, b) => b.score - a.score || a.sentence.length - b.sentence.length)
    .map((entry) => entry.sentence);
  return unique(early.concat(scored)).slice(0, 6);
}

function buildTakeaways(item, bullets) {
  const text = `${item.title} ${item.summary} ${bullets.join(" ")}`;
  const takeaways = [];

  if (/model|模型|benchmark|参数|inference|推理/i.test(text)) {
    takeaways.push("适合从模型能力、适用场景和同类方案对比切入。");
  }
  if (/agent|workflow|tool|工具|智能体|自动化/i.test(text)) {
    takeaways.push("适合延展成工具使用场景、工作流效率或产品观察。");
  }
  if (/open source|github|开源|license|社区/i.test(text)) {
    takeaways.push("适合强调开源生态、开发者采用门槛和二次开发价值。");
  }
  if (/image|video|diffusion|绘画|视频|创作|生成/i.test(text)) {
    takeaways.push("适合转成创作灵感、案例拆解或视觉工具推荐。");
  }
  if (!takeaways.length) {
    takeaways.push("适合先作为今日 AI 动态快讯，再结合原文核对后扩写。");
  }

  return takeaways.slice(0, 3);
}

async function fetchArticleHtml(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "text/html,application/xhtml+xml,text/plain;q=0.8,*/*;q=0.5",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36 AI-Curator/1.0",
      },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const contentType = response.headers.get("content-type") || "";
    if (!/html|text|xml/i.test(contentType)) {
      throw new Error(`不支持的内容类型：${contentType || "unknown"}`);
    }

    const html = await response.text();
    return html.slice(0, MAX_HTML_BYTES);
  } finally {
    clearTimeout(timer);
  }
}

async function extractArticle(item) {
  const fallbackSummary = item.summary || "暂未抓取到正文，可打开原文后人工核对。";
  const fallbackBlocks = [fallbackSummary].filter(Boolean);

  try {
    const html = await fetchArticleHtml(item.url);
    const title =
      extractMeta(html, "og:title") ||
      stripTags((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "") ||
      item.title;
    const metaSummary =
      extractMeta(html, "og:description") ||
      extractMeta(html, "description") ||
      item.summary ||
      "";
    const blocks = extractBlocks(html);
    const contentBlocks = blocks.length ? blocks : fallbackBlocks;
    const bullets = buildBullets(contentBlocks.concat(metaSummary ? [metaSummary] : []), item);
    const leadBlocks = contentBlocks
      .slice(0, 8)
      .filter((block) => block.length <= 360 && !/back to articles|published|upvote/i.test(block));
    const summarySource = leadBlocks.length
      ? leadBlocks.slice(0, 3).join(" ")
      : bullets.length
        ? bullets.slice(0, 3).join(" ")
        : metaSummary || fallbackSummary;

    return {
      ok: true,
      title: title || item.title,
      sourceUrl: item.url,
      summary: limitText(summarySource, 420),
      bullets: bullets.length ? bullets : [fallbackSummary],
      takeaways: buildTakeaways(item, bullets),
      excerpts: contentBlocks.slice(0, 5).map((block) => limitText(block, 260)),
      wordCount: contentBlocks.join("").length,
      warning:
        blocks.length < 2
          ? "原站正文较少或页面由前端渲染，已使用可抓取内容和列表摘要生成摘选。"
          : "",
    };
  } catch (error) {
    return {
      ok: false,
      title: item.title,
      sourceUrl: item.url,
      summary: fallbackSummary,
      bullets: [fallbackSummary],
      takeaways: buildTakeaways(item, [fallbackSummary]),
      excerpts: fallbackBlocks,
      wordCount: fallbackSummary.length,
      warning: `原文抓取失败：${error.message}。已用列表摘要生成社区简报，请打开原文核对。`,
    };
  }
}

module.exports = {
  extractArticle,
};
