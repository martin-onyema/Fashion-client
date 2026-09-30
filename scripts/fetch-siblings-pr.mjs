import fs from 'fs';

const OUT = '/tmp/artifacts4';
const frameUrl = fs.readFileSync(`${OUT}/frame-url.txt`, 'utf8').trim();
const base = frameUrl.split('?')[0].replace(/\/[^/]*$/, '/');

const FILES = [
  '24-delivery-charges-mockup.html',
  '31-wallet-mockup.html',
  '32-account-profiles-mockup.html',
  '33-consultation-booking-flow-mockup.html',
  '34-sale-clearance-mockup.html',
  '15-style-guide-mockup.html',
  'DEVELOPER-NOTES.md',
];

const { default: ZAI } = await import('z-ai-web-dev-sdk');
const zai = await ZAI.create();

for (const f of FILES) {
  try {
    const res = await zai.functions.invoke('page_reader', { url: `${base}${f}` });
    const html = res.data?.html ?? '';
    fs.writeFileSync(`${OUT}/pr-${f.replace(/[^a-z0-9.-]/gi, '_')}`, html);
    const title = html.match(/<title>([^<]*)<\/title>/)?.[1] || '';
    console.log(`OK ${f}: len=${html.length} title="${title}" unavailable=${/Unavailable/.test(html.slice(0, 500))}`);
  } catch (e) {
    console.log(`FAIL ${f}: ${String(e.message).slice(0, 100)}`);
  }
}
