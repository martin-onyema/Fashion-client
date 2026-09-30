import re, sys, html as H

def outline(path, maxlen=9000):
    h = open(path, encoding='utf8', errors='replace').read()
    # strip style/script
    h2 = re.sub(r'<style[\s\S]*?</style>', ' ', h)
    h2 = re.sub(r'<script[\s\S]*?</script>', ' ', h2)
    # mark headings and structure
    h2 = re.sub(r'<(h[1-4])[^>]*>', lambda m: f'\n[{m.group(1).upper()}] ', h2)
    h2 = re.sub(r'<(tr|li|p|div|section|footer|button|label)[^>]*>', '\n', h2)
    h2 = re.sub(r'<td[^>]*>', ' | ', h2)
    t = re.sub(r'<[^>]+>', ' ', h2)
    t = H.unescape(t)
    t = re.sub(r'[ \t]+', ' ', t)
    t = re.sub(r'\n\s*\n+', '\n', t)
    print(t.strip()[:maxlen])

if __name__ == '__main__':
    outline(sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 9000)
