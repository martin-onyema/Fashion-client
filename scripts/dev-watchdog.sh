#!/bin/bash
# Dev-server watchdog — keeps the preview site + file downloads alive.
# Checks every 45s; restarts `next dev` if it stops responding.
cd /home/z/my-project
LOG=watchdog.log
echo "$(date) watchdog started" >> $LOG
while true; do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 8 http://localhost:3000/ 2>/dev/null)
  if [ "$code" != "200" ]; then
    echo "$(date) DOWN (code=$code) — restarting" >> $LOG
    pkill -f "next dev" 2>/dev/null
    sleep 3
    nohup bun run dev >> dev.log 2>&1 &
    # wait up to 60s for it to come back
    for i in $(seq 1 30); do
      sleep 2
      c=$(curl -s -o /dev/null -w "%{http_code}" --max-time 8 http://localhost:3000/ 2>/dev/null)
      [ "$c" = "200" ] && { echo "$(date) RECOVERED after $((i*2))s" >> $LOG; break; }
    done
  fi
  sleep 45
done
