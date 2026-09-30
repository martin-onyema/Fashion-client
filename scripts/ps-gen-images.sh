#!/bin/bash
# Task 27 — Personal Shopping page: high-res editorial imagery
set -e
cd /home/z/my-project

z-ai image -p "Editorial photograph of a premium menswear personal shopping session: long wooden rail of tailored jackets and crisp shirts in white, cream, chocolate and earth tones, leather bag and fabric swatch cards laid on a walnut table, warm window light, muted warm neutral palette, soft shadows, shallow depth of field, luxury boutique interior, high-end fashion editorial photography, photorealistic, ultra detailed, no people, no text" \
  -o /tmp/ps-hero-raw.png -s 2880x1440

z-ai image -p "Editorial photograph of a menswear stylist hands holding fabric swatch cards over a walnut table with a folded cream linen shirt, brown leather belt and suede loafers arranged neatly, warm neutral tones, soft window light, luxury personal styling session, shallow depth of field, high-end fashion editorial photography, photorealistic, ultra detailed, no faces, no text" \
  -o /tmp/ps-detail-raw.png -s 1152x1536

echo "--- raw files ---"
ls -la /tmp/ps-hero-raw.png /tmp/ps-detail-raw.png
