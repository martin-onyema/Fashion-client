const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.serviceEnquiry.findFirst({ orderBy: { createdAt: 'desc' } })
  .then(r => { console.log('LATEST:', JSON.stringify({ num: r.enquiryNumber, name: r.customerName, slug: r.serviceSlug, budget: r.budget, size: r.clothingSize, date: r.preferredDate, msg: (r.message||'').slice(0,80) }, null, 1)); return p.$disconnect(); })
  .catch(e => { console.log('ERR:', e.message.slice(0, 200)); process.exit(0); });
