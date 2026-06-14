import html
import mimetypes
import re
from pathlib import Path


ROOT = Path("/Users/jelly/Documents/New project")
SRC = ROOT / "AI社区平台竞品调研分析与产品需求PRD_V1.0.md"
OUT = ROOT / "AI社区平台竞品调研分析与产品需求PRD_V1.0_飞书备用HTML.html"


def inline_image(match):
    alt = html.escape(match.group(1))
    raw = match.group(2).strip()
    if raw.startswith("<") and raw.endswith(">"):
        raw = raw[1:-1]
    path = Path(raw)
    if not path.is_absolute():
        path = ROOT / path
    if not path.exists():
        return f"<p>[图片缺失] {html.escape(str(path))}</p>"
    mime = mimetypes.guess_type(path.name)[0] or "image/png"
    import base64
    data = base64.b64encode(path.read_bytes()).decode("ascii")
    return f'<figure><img src="data:{mime};base64,{data}" alt="{alt}"><figcaption>{alt}</figcaption></figure>'


def convert_inline(text):
    text = html.escape(text)
    text = re.sub(r"`([^`]+)`", r"<code>\1</code>", text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"\[([^\]]+)\]\((https?://[^)]+)\)", r'<a href="\2">\1</a>', text)
    text = re.sub(r"\[([^\]]+)\]\(&lt;([^&]+)&gt;\)", r'<a href="\2">\1</a>', text)
    return text


def table_to_html(lines):
    rows = []
    for line in lines:
        if re.match(r"^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$", line):
            continue
        s = line.strip()
        if s.startswith("|"):
            s = s[1:]
        if s.endswith("|"):
            s = s[:-1]
        rows.append([convert_inline(c.strip()) for c in s.split("|")])
    if not rows:
        return ""
    out = ["<table>"]
    for idx, row in enumerate(rows):
        tag = "th" if idx == 0 else "td"
        out.append("<tr>" + "".join(f"<{tag}>{c}</{tag}>" for c in row) + "</tr>")
    out.append("</table>")
    return "\n".join(out)


def main():
    md = SRC.read_text("utf-8")
    md = re.sub(r"!\[([^\]]*)\]\(([^)]+\.png>?)\)", inline_image, md)
    lines = md.splitlines()
    body = []
    i = 0
    in_code = False
    code = []
    while i < len(lines):
        line = lines[i]
        if line.startswith("```"):
            if in_code:
                body.append(f"<pre><code>{html.escape(chr(10).join(code))}</code></pre>")
                code = []
                in_code = False
            else:
                in_code = True
            i += 1
            continue
        if in_code:
            code.append(line)
            i += 1
            continue
        if not line.strip():
            i += 1
            continue
        if line.startswith("<figure>"):
            body.append(line)
            i += 1
            continue
        if line.strip() == "---":
            body.append("<hr>")
            i += 1
            continue
        if line.lstrip().startswith("|") and i + 1 < len(lines) and re.match(r"^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$", lines[i + 1]):
            tbl = [line, lines[i + 1]]
            i += 2
            while i < len(lines) and lines[i].lstrip().startswith("|"):
                tbl.append(lines[i])
                i += 1
            body.append(table_to_html(tbl))
            continue
        h = re.match(r"^(#{1,6})\s+(.+)$", line)
        if h:
            level = len(h.group(1))
            body.append(f"<h{level}>{convert_inline(h.group(2))}</h{level}>")
            i += 1
            continue
        b = re.match(r"^\s*[-*]\s+(.+)$", line)
        if b:
            body.append(f"<p>• {convert_inline(b.group(1))}</p>")
            i += 1
            continue
        body.append(f"<p>{convert_inline(line.strip())}</p>")
        i += 1

    page = """<!doctype html>
<html><head><meta charset="utf-8"><title>AI社区平台竞品调研分析与产品需求PRD</title>
<style>
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif;line-height:1.62;margin:32px;max-width:1080px}
table{border-collapse:collapse;width:100%;margin:14px 0;font-size:13px}
th,td{border:1px solid #d0d7de;padding:6px 8px;vertical-align:top}
th{background:#f6f8fa}
img{max-width:100%;border:1px solid #d0d7de;border-radius:6px}
figcaption{font-size:12px;color:#57606a;margin-top:4px}
pre{background:#f6f8fa;padding:12px;overflow:auto}
code{font-family:Menlo,Consolas,monospace}
</style></head><body>
""" + "\n".join(body) + "\n</body></html>"
    OUT.write_text(page, "utf-8")
    print(OUT)


if __name__ == "__main__":
    main()
