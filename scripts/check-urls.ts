import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function check(url: string): Promise<number> {
  try {
    const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(15000) })
    return res.status
  } catch {
    return -1
  }
}

async function main() {
  const cats = await prisma.category.findMany({ select: { slug: true, image: true } })
  const urls = new Set<string>()
  for (const c of cats) if (c.image?.startsWith('http')) urls.add(c.image)
  const banners = await prisma.promotionalBanner.findMany().catch(() => [])
  for (const b of banners as Record<string, string>[]) {
    for (const k of Object.keys(b)) if (typeof b[k] === 'string' && (b[k] as string).startsWith('http')) urls.add(b[k])
  }
  const campaigns = await prisma.campaign.findMany().catch(() => [])
  for (const c of campaigns as Record<string, string>[]) {
    for (const k of Object.keys(c)) if (typeof c[k] === 'string' && (c[k] as string).startsWith('http') && /image|img|banner/i.test(k)) urls.add(c[k])
  }
  const home = await prisma.homepageContent.findFirst()
  if (home) {
    const rec = home as unknown as Record<string, string | null>
    for (const k of Object.keys(rec)) {
      const v = rec[k]
      if (typeof v === 'string' && v.startsWith('http') && /image|hero/i.test(k)) urls.add(v)
      if (typeof v === 'string' && v.startsWith('[') && v.includes('unsplash')) {
        try { for (const u of JSON.parse(v) as string[]) if (u.startsWith('http')) urls.add(u) } catch {}
      }
    }
  }
  console.log(`Checking ${urls.size} distinct external URLs...`)
  const bad: string[] = []
  for (const u of urls) {
    const s = await check(u)
    if (s !== 200) { bad.push(`${s} ${u}`); console.log(`  BAD ${s}: ${u}`) }
    else console.log(`  ok  ${u.slice(0, 90)}`)
  }
  console.log(`\nDONE. ${bad.length} bad of ${urls.size}`)
  console.log(`Banners: ${(banners as unknown[]).length}, Campaigns: ${(campaigns as unknown[]).length}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
