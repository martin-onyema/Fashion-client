import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const OUT = '/tmp/artifacts3';
fs.mkdirSync(OUT, { recursive: true });

const UUIDS = [
  { id: '5e5c3592-c8a6-46e8-9e63-5696f7243aa0', tag: 'new-5e5c' },
  { id: 'f63cf53b-8438-4087-96da-8e3508dec792', tag: 'batch-f63c' },
  { id: 'd5cd49f8-2ea1-45fe-8a61-dd4157c89850', tag: 'batch-d5cd' },
];

const zai = await ZAI.create();

for (const { id, tag } of UUIDS) {
  try {
    const res = await zai.functions.invoke('page_reader', {
      url: `https://claude.ai/api/published_artifacts/${id}`,
    });
    // res.data.html may wrap JSON in <html><body><pre>...</pre></body></html>
    let raw = res.data?.html ?? '';
    const m = raw.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
    const jsonText = m ? m[1] : raw;
    let art = null;
    try {
      art = JSON.parse(jsonText);
    } catch {
      // sometimes HTML-escaped entities inside pre
      const unescaped = jsonText
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
      try { art = JSON.parse(unescaped); } catch (e2) { art = { _parseError: String(e2) }; }
    }
    const title = art?.title || art?.artifact?.title || res.data?.title || '(no title)';
    const content = art?.content ?? art?.artifact?.content ?? '';
    fs.writeFileSync(`${OUT}/${tag}-title.txt`, String(title));
    fs.writeFileSync(`${OUT}/${tag}-content.html`, String(content));
    fs.writeFileSync(`${OUT}/${tag}-raw.json`, JSON.stringify(art).slice(0, 2000));
    console.log(`OK ${tag}: title="${title}" contentLen=${content.length}`);
  } catch (e) {
    console.log(`FAIL ${tag}: ${e.message}`);
    fs.writeFileSync(`${OUT}/${tag}-error.txt`, String(e.message));
  }
}
