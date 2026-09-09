import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const content = await prisma.homepageContent.findFirst()
  const ig: string[] = content?.instagramImages ? JSON.parse(content.instagramImages) : []
  console.log('FULL IG LIST:')
  ig.forEach((u, i) => console.log(`${i}: ${u}`))
}

main().catch(console.error).finally(() => prisma.$disconnect())
