"""Find which Supabase pooler hostnames exist in public DNS (via Google DoH),
then report candidates. Local resolver is unreliable for pooler.supabase.com."""
import json, urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor

REF = 'uvnuhhazklixymhtcshq'
REGIONS = [
    'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2', 'ca-central-1', 'sa-east-1',
    'eu-central-1', 'eu-central-2', 'eu-west-1', 'eu-west-2', 'eu-west-3',
    'eu-north-1', 'eu-south-1', 'eu-south-2',
    'ap-south-1', 'ap-south-2', 'ap-southeast-1', 'ap-southeast-2',
    'ap-southeast-3', 'ap-southeast-4', 'ap-northeast-1', 'ap-northeast-2',
    'ap-northeast-3', 'ap-east-1', 'me-south-1', 'me-central-1',
    'af-south-1', 'il-central-1',
]
PREFIXES = ['aws-0', 'aws-1', 'aws-2', 'aws-3']
combos = [f'{p}-{r}' for p in PREFIXES for r in REGIONS]  # aws-0-eu-central-1 style

def doh_a(name):
    url = 'https://dns.google/resolve?' + urllib.parse.urlencode({'name': name, 'type': 'A'})
    try:
        with urllib.request.urlopen(url, timeout=10) as r:
            data = json.loads(r.read().decode())
        answers = [a['data'] for a in data.get('Answer', []) if a.get('type') == 1]
        return name, answers
    except Exception as e:
        return name, f'ERR {e}'

def check(combo):
    name = f'{combo}.pooler.supabase.com'
    name_, ans = doh_a(name)
    if isinstance(ans, list) and ans:
        return (combo, ans)
    return None

existing = []
with ThreadPoolExecutor(max_workers=8) as ex:
    for res in ex.map(check, combos):
        if res:
            existing.append(res)
            print('EXISTS:', res[0], '->', res[1])

print()
print('Total existing pooler hosts:', len(existing))
for combo, ips in existing:
    print(f'CANDIDATE: {combo} ips={ips}')
