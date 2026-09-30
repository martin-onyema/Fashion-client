import ZAI from 'z-ai-web-dev-sdk'
import fs from 'fs'

// Generates the Amendments & Alterations service hero (self-hosted, consistent
// with the other /services images). 2880x1440 max allowed (32-multiples, <=2^22 px).

const jobs = [
  {
    prompt:
      'Editorial photograph of a premium menswear tailoring atelier: tailor at work adjusting the sleeve of a charcoal blazer on a dress form, measuring tape draped around neck, thread spools shears and chalk on a walnut workbench, half-finished trousers hanging nearby, warm window light, muted warm neutral palette, soft shadows, shallow depth of field, high-end fashion editorial photography, photorealistic, ultra detailed, no text',
    size: '2880x1440',
    out: '/tmp/alt-hero-raw.png',
  },
]

async function main() {
  const zai = await ZAI.create()
  for (const j of jobs) {
    let ok = false
    for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
      try {
        console.log(`generating ${j.size} (attempt ${attempt})...`)
        const res = await zai.images.generations.create({ prompt: j.prompt, size: j.size })
        const b64 = res?.data?.[0]?.base64
        if (!b64) throw new Error('no base64 in response')
        const buf = Buffer.from(b64, 'base64')
        fs.writeFileSync(j.out, buf)
        console.log(`saved ${j.out} (${(buf.length / 1024 / 1024).toFixed(2)} MB)`)
        ok = true
      } catch (e) {
        console.error(`attempt ${attempt} failed:`, e?.message || e)
        if (attempt === 3) throw e
        await new Promise((r) => setTimeout(r, 1500 * attempt))
      }
    }
  }
  console.log('done')
}

main()
