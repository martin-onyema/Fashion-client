import fs from 'fs';
import { execSync } from 'child_process';

const OUT = '/tmp/artifacts4';
fs.mkdirSync(OUT, { recursive: true });

const CODE = 'A9K7ihBUwcFQvtDdNokRjf';

// Step 1: page_reader the viewer URL to get the SPA shell with iframe src
async function main() {
  const { default: ZAI } = await import('z-ai-web-dev-sdk');
  const zai = await ZAI.create();
  const viewer = await zai.functions.invoke('page_reader', { url: `https://claude.ai/artifact/${CODE}` });
  const shell = viewer.data?.html ?? '';
  fs.writeFileSync(`${OUT}/index-viewer-shell.html`, shell);
  console.log('shell length:', shell.length);

  // Step 2: extract iframe src (claudeusercontent /_f/ pattern)
  const m = shell.match(/https:\/\/[a-z0-9.-]*claudeusercontent\.com\/_f\/[^"'\s<>]+/i);
  if (!m) {
    console.log('NO IFRAME SRC FOUND — dumping candidate URLs:');
    const urls = [...shell.matchAll(/https:\/\/[^"'\s<>]+/g)].map((x) => x[0]).filter((u) => /frame|artifact|claude/i.test(u));
    console.log([...new Set(urls)].slice(0, 20).join('\n'));
    return;
  }
  const frameUrl = m[0].replace(/&amp;/g, '&');
  console.log('frame url:', frameUrl.slice(0, 120));

  // Step 3: direct curl of the frame URL (frame hosts not region-blocked)
  fs.writeFileSync(`${OUT}/frame-url.txt`, frameUrl);
  execSync(
    `curl -sL --max-time 60 -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36" "${frameUrl}" -o ${OUT}/index-frame.html`,
    { stdio: 'inherit' },
  );
  const frame = fs.readFileSync(`${OUT}/index-frame.html`, 'utf8');
  console.log('frame doc length:', frame.length);

  // Step 4: artifact HTML sits after the frame-runtime marker
  const MARK = '<!-- /frame-runtime -->';
  const i = frame.indexOf(MARK);
  const art = i >= 0 ? frame.slice(i + MARK.length).trim() : '';
  fs.writeFileSync(`${OUT}/index-artifact.html`, art);
  console.log('artifact length:', art.length);
  if (art) {
    const title = art.match(/<title>([^<]*)<\/title>/)?.[1] || '';
    const h1 = art.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]?.replace(/<[^>]+>/g, '').trim() || '';
    console.log('title:', title);
    console.log('h1:', h1);
    // dump all links inside the artifact (it is an index page)
    const links = [...art.matchAll(/href="([^"]+)"/g)].map((x) => x[1]);
    console.log('--- LINKS (' + links.length + ') ---');
    [...new Set(links)].forEach((l) => console.log(l));
  }
}

main().catch((e) => {
  console.error('FAIL', e.message);
  process.exit(1);
});
