import ZAI from 'z-ai-web-dev-sdk'
import fs from 'fs'

// API rule: each side 512–2880, multiple of 32, w*h <= 2^22 (4,194,304)
// 2880x1440 = 4,147,200 ✓   1152x1536 = 1,769,088 ✓

const jobs = [
  {
    prompt:
      'Editorial photograph of a premium menswear personal shopping session: long wooden rail of tailored jackets and crisp shirts in white, cream, chocolate and earth tones, leather bag and fabric swatch cards laid on a walnut table, warm window light, muted warm neutral palette, soft shadows, shallow depth of field, luxury boutique interior, high-end fashion editorial photography, photorealistic, ultra detailed, no people, no text',
    size: '2880x1440',
    out: '/tmp/ps-hero-raw.png',
  },
  {
    prompt:
      "Editorial photograph of a menswear stylist's hands holding fabric swatch cards over a walnut table with a folded cream linen shirt, brown leather belt and suede loafers arranged neatly, warm neutral tones, soft window light, luxury personal styling session, shallow depth of field, high-end fashion editorial photography, photorealistic, ultra detailed, no faces, no text",
    size: '1152x1536',
    out: '/tmp/ps-detail-raw.png',
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

main().catch((e) => {
  console.error('FATAL', e?.message || e)
  process.exit(1)
})
