import fs from 'fs';

const OUT = '/tmp/artifacts4';
const UUID = '4a0b5cc5-3702-411f-ad47-5a5c9c3b18c2';
const CODE = 'A9K7ihBUwcFQvtDdNokRjf';

const { default: ZAI } = await import('z-ai-web-dev-sdk');
const zai = await ZAI.create();

const tries = [
  `https://claude.ai/api/published_artifacts/${UUID}`,
  `https://claude.ai/api/published_artifacts/${CODE.replace(/([a-z0-9]{8})([a-z0-9]{4})/, '$1-$2')}`,
];

for (const url of tries) {
  try {
    const res = await zai.functions.invoke('page_reader', { url });
    const html = res.data?.html ?? '';
    const m = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
    const body = m ? m[1] : html;
    console.log(`URL ${url.slice(-60)}`);
    console.log('  len:', body.length, 'head:', body.slice(0, 200).replace(/\n/g, ' '));
    fs.writeFileSync(`${OUT}/api-try-${url.slice(-20)}.json`, body);
  } catch (e) {
    console.log(`FAIL ${url.slice(-60)}: ${String(e.message).slice(0, 80)}`);
  }
}
