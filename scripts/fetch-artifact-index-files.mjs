import fs from 'fs';
import { execSync } from 'child_process';

const OUT = '/tmp/artifacts4';

const frameUrl = fs.readFileSync(`${OUT}/frame-url.txt`, 'utf8').trim();
// base = everything up to the last "/" before the query
const base = frameUrl.split('?')[0].replace(/\/[^/]*$/, '/');
console.log('base:', base);

const FILES = [
  '24-delivery-charges-mockup.html',
  '31-wallet-mockup.html',
  '32-account-profiles-mockup.html',
  '33-consultation-booking-flow-mockup.html',
  '34-sale-clearance-mockup.html',
  '15-style-guide-mockup.html',
  'DEVELOPER-NOTES.md',
  'DEVELOPER-NOTES-SERVICES.md',
  'services-config.js',
];

const MARK = '<!-- /frame-runtime -->';

for (const f of FILES) {
  const url = `${base}${f}`;
  const out = `${OUT}/${f.replace(/[^a-z0-9.-]/gi, '_')}`;
  try {
    execSync(
      `curl -sL --max-time 60 -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36" "${url}" -o "${out}"`,
      { stdio: 'pipe' },
    );
    const raw = fs.readFileSync(out, 'utf8');
    const i = raw.indexOf(MARK);
    const art = i >= 0 ? raw.slice(i + MARK.length).trim() : raw;
    const size = fs.statSync(out).size;
    const title = art.match(/<title>([^<]*)<\/title>/)?.[1] || '';
    const h1 = art.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]?.replace(/<[^>]+>/g, '').trim() || '';
    console.log(`OK ${f}: file=${size}B art=${art.length}B title="${title}" h1="${h1.slice(0, 60)}"`);
    if (art.length > 500) fs.writeFileSync(out.replace('.html', '.art.html'), art);
    else if (raw.length < 500) console.log('   body head:', JSON.stringify(raw.slice(0, 200)));
  } catch (e) {
    console.log(`FAIL ${f}: ${String(e.message).slice(0, 120)}`);
  }
}
