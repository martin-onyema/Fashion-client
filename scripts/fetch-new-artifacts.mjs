import ZAI from 'z-ai-web-dev-sdk'
import fs from 'fs'

// 7 new links from the user (2026-09-22)
const LINKS = [
  { id: 'n1', kind: 'uuid',  ref: '9dd56133-a49e-4cf4-b196-b217c5c0a86f' },
  { id: 'n2', kind: 'short', ref: 'P1NPQ85XHTkctmJvw14p1i' },
  { id: 'n3', kind: 'short', ref: 'WY2GJ9HLayCKjnFSfcMgC8' },
  { id: 'n4', kind: 'short', ref: '4beAEXgEk5rT4FdKPftVZE' },
  { id: 'n5', kind: 'file',  ref: 'https://loadedfiles.net/79769ddf98ee5c2b?pt=dlpnNG1aRUF5Q1YxNDVyS3BzcjJRbFV3YTA1T2VrcGFNbGt4T1RCWlpuVmxNa2x1YTBFOVBRPT0%3D' },
  { id: 'n6', kind: 'short', ref: 'QePDEDT7xyvkhqPoKwycAE' }, // known: Digital Closet (Task 24/25) — verify only
  { id: 'n7', kind: 'short', ref: 'A9K7ihBUwcFQvtDdNokRjf' },
]

const OUT = '/tmp/artifacts2'
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

function extractIframe(html) {
  const m = html.match(/https:\/\/[a-z0-9.-]*claudeusercontent\.com\/_f\/[^"'\\\s<>]+/i)
  return m ? m[0] : null
}

function unwrapJson(html) {
  // page_reader wraps raw JSON responses in <html><body><pre>...</pre>
  const m = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i)
  let raw = m ? m[1] : html
  raw = raw.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#x27;/g, "'")
  return raw.trim()
}

async function readPage(zai, url, tag) {
  const r = await zai.functions.invoke('page_reader', { url })
  const html = typeof r === 'string' ? r : (r?.data?.html || r?.content || r?.html || JSON.stringify(r))
  fs.writeFileSync(`${OUT}/${tag}.html`, html)
  return html
}

async function main() {
  const zai = await ZAI.create()

  for (const L of LINKS) {
    console.log(`\n===== ${L.id} (${L.kind}) ${L.ref.slice(0, 50)}`)
    try {
      if (L.kind === 'uuid') {
        // Task 29 recipe: page_reader on the API URL returns full artifact JSON
        const api = `https://claude.ai/api/published_artifacts/${L.ref}`
        const raw = await readPage(zai, api, `${L.id}-api`)
        console.log('api len:', raw.length)
        const clean = unwrapJson(raw)
        fs.writeFileSync(`${OUT}/${L.id}-api.json`, clean)
        const j = JSON.parse(clean)
        console.log('TITLE:', j.title, '| type:', j.type)
        if (j.content) fs.writeFileSync(`${OUT}/${L.id}-content.html`, j.content)
        if (j.artifact?.content) fs.writeFileSync(`${OUT}/${L.id}-content.html`, j.artifact.content)
        console.log('content saved:', (j.content || j.artifact?.content || '').length)
      } else if (L.kind === 'short') {
        // Task 24 recipe: viewer -> iframe src -> iframe doc contains the artifact
        const viewer = `https://claude.ai/artifact/${L.ref}`
        const page = fs.existsSync(`${OUT}/${L.id}-page.html`) && L.id !== 'n6'
          ? fs.readFileSync(`${OUT}/${L.id}-page.html`, 'utf8')
          : await readPage(zai, viewer, `${L.id}-page`)
        console.log('viewer len:', page.length)
        const iframe = extractIframe(page)
        console.log('iframe:', iframe ? iframe.slice(0, 110) : 'NONE')
        if (iframe) {
          await sleep(800)
          const frame = await readPage(zai, iframe, `${L.id}-frame`)
          console.log('frame len:', frame.length)
          console.log('frame head:', frame.slice(0, 250).replace(/\n/g, ' '))
        }
      } else if (L.kind === 'file') {
        // direct curl
        const { execSync } = await import('child_process')
        try {
          execSync(`curl -sL --max-time 45 -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36" "${L.ref}" -o ${OUT}/${L.id}-raw.bin`, { stdio: 'pipe' })
          const st = fs.statSync(`${OUT}/${L.id}-raw.bin`)
          console.log('file bytes:', st.size)
          const buf = fs.readFileSync(`${OUT}/${L.id}-raw.bin`)
          console.log('head:', buf.slice(0, 300).toString('utf8').replace(/\n/g, ' '))
        } catch (e) { console.log('curl err:', e?.message?.slice(0, 200)) }
      }
    } catch (e) {
      console.log('ERR:', (e?.message || String(e)).slice(0, 300))
    }
    await sleep(600)
  }
}

main().catch(e => { console.error('FATAL', e?.message || e); process.exit(1) })
