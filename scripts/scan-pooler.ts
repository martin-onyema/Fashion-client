import postgres from 'postgres'

const REF = 'uvnuhhazklixymhtcshq'
const PW = 'mm4you,,A..'

// (host, first IPv4) pairs sourced from the public DoH scan (scripts/doh-scan-pooler.py)
const HOST_IPS: [string, string][] = [
  ['aws-0-us-east-1', '44.208.221.186'], ['aws-0-us-east-2', '13.59.95.192'],
  ['aws-0-us-west-1', '54.177.55.191'], ['aws-0-us-west-2', '44.238.118.41'],
  ['aws-0-ca-central-1', '15.156.180.136'], ['aws-0-sa-east-1', '15.229.150.166'],
  ['aws-0-eu-central-1', '52.59.152.35'], ['aws-0-eu-central-2', '51.96.34.188'],
  ['aws-0-eu-west-1', '52.209.89.87'], ['aws-0-eu-west-2', '18.135.253.94'],
  ['aws-0-eu-west-3', '15.188.134.6'], ['aws-0-eu-north-1', '13.60.109.208'],
  ['aws-0-ap-south-1', '3.111.105.85'], ['aws-0-ap-southeast-1', '52.77.146.31'],
  ['aws-0-ap-southeast-2', '13.238.183.126'], ['aws-0-ap-northeast-1', '54.64.190.72'],
  ['aws-0-ap-northeast-2', '13.124.111.232'], ['aws-0-ap-east-1', '18.163.249.119'],
  ['aws-1-us-east-1', '18.214.78.123'], ['aws-1-us-east-2', '3.148.140.216'],
  ['aws-1-us-west-1', '3.101.5.153'], ['aws-1-us-west-2', '34.215.156.231'],
  ['aws-1-ca-central-1', '3.98.197.182'], ['aws-1-sa-east-1', '52.67.188.92'],
  ['aws-1-eu-central-1', '18.196.8.182'], ['aws-1-eu-central-2', '16.62.196.150'],
  ['aws-1-eu-west-1', '54.247.26.119'], ['aws-1-eu-west-2', '13.43.174.140'],
  ['aws-1-eu-west-3', '52.47.148.215'], ['aws-1-eu-north-1', '51.21.189.77'],
  ['aws-1-ap-south-1', '3.109.171.244'], ['aws-1-ap-southeast-1', '13.213.241.248'],
  ['aws-1-ap-southeast-2', '52.62.122.103'], ['aws-1-ap-northeast-1', '57.182.231.186'],
  ['aws-1-ap-northeast-2', '43.202.154.182'],
]

async function probe(host: string, ip: string, port: number) {
  const sql = postgres({
    host: ip, port, database: 'postgres',
    username: `postgres.${REF}`, password: PW,
    max: 1, connect_timeout: 8, idle_timeout: 3,
    ssl: { rejectUnauthorized: false, servername: host },
  })
  try {
    const r = await sql`select current_database() as db, current_user as usr`
    await sql.end({ timeout: 2 })
    return { host, port, ok: true, info: `${r[0]?.db} / ${r[0]?.usr}` }
  } catch (e: any) {
    try { await sql.end({ timeout: 1 }) } catch {}
    return { host, port, ok: false, info: String(e?.message ?? e).slice(0, 80) }
  }
}

const results: { host: string; port: number; ok: boolean; info: string }[] = []
const CHUNK = 8
for (let i = 0; i < HOST_IPS.length; i += CHUNK) {
  const res = await Promise.all(HOST_IPS.slice(i, i + CHUNK).map(([h, ip]) => probe(h, ip, 6543)))
  results.push(...res)
  if (res.some((r) => r.ok)) break
}

const hit = results.find((r) => r.ok)
for (const r of results) console.log(r.ok ? 'CONNECTED ' : 'rejected  ', r.host, '->', r.info)

if (hit) {
  console.log(`\nPROJECT POOLER FOUND: ${hit.host} (${hit.info})`)
  const pair = HOST_IPS.find(([h]) => h === hit.host)!
  const sess = await probe(pair[0], pair[1], 5432)
  console.log('Session mode 5432:', sess.ok ? 'CONNECTED' : `rejected (${sess.info})`)
}
