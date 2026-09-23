import ZAI from 'z-ai-web-dev-sdk'
import fs from 'fs'

const VIEWER = 'https://claude.ai/public/artifacts/fd04d35d-5640-4bd3-ae69-2355e553321f'

function extractIframe(html) {
  const m = html.match(/https:\/\/[a-z.]*claudeusercontent\.com\/[^"'\\\s<>]+/i)
  return m ? m[0] : null
}

async function main() {
  const zai = await ZAI.create()

  // Step 1: read the viewer page, find the iframe src
  console.log('[1] reading viewer page...')
  const r1 = await zai.functions.page_reader({ url: VIEWER })
  const html1 = typeof r1 === 'string' ? r1 : (r1?.content || r1?.html || JSON.stringify(r1))
  fs.writeFileSync('/home/z/my-project/scripts/ps-artifact-page.html', html1)
  const iframe = extractIframe(html1)
  console.log('iframe src:', iframe)
  if (!iframe) {
    console.log('No iframe found. First 1500 chars of viewer content:')
    console.log(html1.slice(0, 1500))
    return
  }

  // Step 2: read the iframe itself
  console.log('[2] reading iframe...')
  const r2 = await zai.functions.page_reader({ url: iframe })
  const html2 = typeof r2 === 'string' ? r2 : (r2?.content || r2?.html || JSON.stringify(r2))
  fs.writeFileSync('/home/z/my-project/scripts/ps-artifact-frame.html', html2)
  console.log('frame length:', html2.length)
  console.log('--- first 1200 chars ---')
  console.log(html2.slice(0, 1200))
}

main().catch(e => { console.error('ERR', e?.message || e); process.exit(1) })
