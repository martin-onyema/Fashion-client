"""Local TCP forwarder to bypass broken DNS for *.pooler.supabase.com.
Forwards 127.0.0.1:6543 -> 54.247.26.119:6543 (transaction pooler)
and     127.0.0.1:5432 -> 54.247.26.119:5432 (session mode / migrations).
Supabase routes by username (postgres.<ref>), so hitting the LB IP directly is safe."""
import asyncio, sys

TARGET_IP = '54.247.26.119'
PAIRS = [(6543, 6543), (5432, 5432)]

async def pipe(r, w, tag):
    try:
        while True:
            data = await r.read(65536)
            if not data:
                break
            w.write(data)
            await w.drain()
    except Exception:
        pass
    finally:
        try:
            w.close()
        except Exception:
            pass

async def handle(r, w, port, tag):
    peer = w.get_extra_info('peername')
    print(f'[{tag}] new conn from {peer} -> {TARGET_IP}:{port}', flush=True)
    try:
        upstream_r, upstream_w = await asyncio.wait_for(
            asyncio.open_connection(TARGET_IP, port), timeout=10)
    except Exception as e:
        print(f'[{tag}] upstream connect FAILED: {e}', flush=True)
        w.close()
        return
    await asyncio.gather(pipe(r, upstream_w, tag), pipe(upstream_r, w, tag))
    print(f'[{tag}] conn closed', flush=True)

async def main():
    loop = asyncio.get_running_loop()
    for lport, rport in PAIRS:
        tag = f':{lport}'
        server = await asyncio.start_server(lambda r, w, p=rport, t=tag: handle(r, w, p, t),
                                            '127.0.0.1', lport)
        print(f'listening 127.0.0.1:{lport} -> {TARGET_IP}:{rport}', flush=True)
    await asyncio.Event().wait()

if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        sys.exit(0)
