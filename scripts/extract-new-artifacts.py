import re, os

OUT = '/tmp/artifacts2'
MARK = '<!-- /frame-runtime -->'

for f in ['n2-frame-curl.html', 'n3-frame-curl.html', 'n4-frame-curl.html', 'n6-frame-curl.html', 'n7-frame-curl.html']:
    h = open(f'{OUT}/{f}', encoding='utf8', errors='replace').read()
    i = h.find(MARK)
    art = h[i + len(MARK):].strip() if i >= 0 else ''
    out = f'{OUT}/{f.split("-")[0]}-artifact.html'
    open(out, 'w', encoding='utf8').write(art)
    print(f, '->', len(art), 'bytes')

# n1: content already saved from API JSON; verify
n1 = open(f'{OUT}/n1-content.html', encoding='utf8').read()
print('n1-content.html', len(n1))
print('  h1:', re.findall(r'<h1[^>]*>(.*?)</h1>', n1, re.S)[:2])
