import fs from 'fs';

const OUT = '/tmp/artifacts4';
const CODE = 'A9K7ihBUwcFQvtDdNokRjf';

const URLS = [
  `https://claude.ai/api/published_artifacts/${CODE}`,
  `https://claude.ai/api/published_artifacts/${CODE}/files`,
  `https://claude.ai/api/artifacts/${CODE}`,
];

const { default: ZAI } = await import('z-ai-web-dev-sdk');
const zai = await ZAI.create();

for (const url of URLS) {
  try {
    const res = await zai.functions.invoke('page_reader', { url });
    const html = res.data?.html ?? '';
    const tag = url.replace(/[^a-z0-9]+/gi, '_').slice(-40);
    fs.writeFileSync(`${OUT}/api-${tag}.json`, html);
    const isJson = html.trim().startsWith('{') || html.trim().startsWith('[');
    console.log(`OK ${url.slice(-50)}: len=${html.length} json=${isJson}`);
    if (isJson) {
      try {
        const j = JSON.parse(html);
        console.log('  keys:', Object.keys(j).slice(0, 15).join(','));
        if (j.artifact) console.log('  artifact keys:', Object.keys(j.artifact).slice(0, 20).join(','));
      } catch { /* partial */ }
    } else {
      console.log('  head:', html.slice(0, 120).replace(/\n/g, ' '));
    }
  } catch (e) {
    console.log(`FAIL ${url.slice(-50)}: ${String(e.message).slice(0, 100)}`);
  }
}
