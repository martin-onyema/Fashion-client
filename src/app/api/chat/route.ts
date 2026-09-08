/**
 * POST /api/chat
 * Streaming chat endpoint backed by z-ai-web-dev-sdk.
 *
 * Body:  { messages: { role: 'user'|'assistant', content: string }[], sessionId?: string }
 * Response: text/plain stream — tokens are emitted as the SDK produces them.
 *
 * The SDK returns SSE-formatted text chunks ("data: {...}\n\n"). We parse each
 * SSE event, extract the `delta.content`, and forward it to the client as plain
 * text tokens. This gives the user the "typing" feel of streaming chat.
 */
import { NextRequest } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_MESSAGES = 20

type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string }

async function buildSystemPrompt(): Promise<string> {
  let productCount = 0
  let categoryCount = 0
  let topCats: { name: string; slug: string }[] = []
  let sampleProducts: { name: string; slug: string; price: number; currency: string }[] = []

  try {
    ;[categoryCount, productCount] = await Promise.all([
      db.category.count(),
      db.product.count({ where: { published: true } }),
    ])
    ;[topCats, sampleProducts] = await Promise.all([
      db.category.findMany({
        take: 12,
        orderBy: { order: 'desc' },
        select: { name: true, slug: true },
      }),
      db.product.findMany({
        take: 6,
        where: { published: true },
        orderBy: { createdAt: 'desc' },
        select: { name: true, slug: true, price: true, currency: true },
      }),
    ])
  } catch (e) {
    console.error('[chat] catalogue lookup failed:', e)
  }

  const currency = (p: { price: number; currency: string }) =>
    `${p.currency} ${p.price.toLocaleString()}`

  return `You are "Wally", the friendly AI shopping assistant for Wardrobecare Clothing — a premium men's fashion store in Nigeria (Surulere, Lagos).

STORE CONTEXT:
- Brand: Wardrobecare Clothing — "Your #1 Personal Shopper for premium men's fashion."
- Catalogue: ${productCount} products across ${categoryCount} categories.
- Currency: Nigerian Naira (NGN).
- Top categories: ${topCats.map((c) => c.name).join(', ') || 'Clothing, T-shirts, Polo, Jeans, Shorts, Pants, Accessories, Footwear, Fragrance'}.

SITE NAVIGATION (suggest these URLs to the user — they will render as clickable links in the chat):
- Shop all: /shop
- New arrivals: /shop?sort=newest
- Cart: /cart
- Checkout: /checkout
- Wishlist: /account/wishlist
- Account / orders: /account
- Contact: /contact-us
- FAQs: /faqs
- Order tracking: /order-tracking
- Admin login: /admin/login
- Refund policy: /refund-returns-2

SAMPLE PRODUCTS (mention these when relevant, link to /product/<slug>):
${sampleProducts.length > 0
  ? sampleProducts.map((p) => `- ${p.name} — ${currency(p)} — /product/${p.slug}`).join('\n')
  : '- (catalogue temporarily unavailable — point users to /shop)'}

YOUR ROLE:
- Greet new visitors warmly and offer to help them find what they need.
- Help users navigate the site by suggesting specific URLs.
- Recommend product categories based on user intent (e.g., "for work", "for a wedding", "casual weekend").
- Answer sizing questions: polos/tees run true to size; formal shirts slim fit; trousers standard waist; when unsure, recommend one size up.
- Be brief and natural — short paragraphs, no walls of text. Usually 1–3 sentences.
- If asked about a specific order status, point them to /order-tracking.
- If asked about returns/refunds, point them to /refund-returns-2.
- If asked about payment options, mention Paystack (cards), bank transfer, and WhatsApp ordering.
- For anything you don't know, suggest they contact support at /contact-us.
- Never invent product names, prices, or URLs that aren't in the context above.
- If the user asks for product recommendations matching a specific style, suggest categories or product slugs from the SAMPLE PRODUCTS list, otherwise point them to /shop.

TONE: warm, confident, premium, helpful. Speak like a knowledgeable personal shopper at a high-end menswear boutique. Keep replies concise — usually under 80 words.`
}

function trimMessages(messages: ChatMessage[]): ChatMessage[] {
  if (messages.length <= MAX_MESSAGES) return messages
  return messages.slice(-MAX_MESSAGES)
}

/**
 * Parse an SSE-formatted Buffer/Uint8Array and yield each `delta.content` token.
 * SSE format:
 *   data: {"choices":[{"delta":{"content":"hello"}}]}\n\n
 *   data: {"choices":[{"delta":{"content":" world"}}]}\n\n
 *   data: [DONE]\n\n
 */
function* parseSseTokens(buf: Uint8Array): Generator<string> {
  const text = Buffer.from(buf).toString('utf8')
  const lines = text.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('data:')) continue
    const payload = trimmed.slice(5).trim()
    if (payload === '[DONE]') continue
    try {
      const json = JSON.parse(payload)
      const token = json?.choices?.[0]?.delta?.content
      if (typeof token === 'string' && token.length > 0) {
        yield token
      }
    } catch {
      // skip malformed line
    }
  }
}

export async function POST(req: NextRequest) {
  let body: { messages?: ChatMessage[]; sessionId?: string }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const incoming = body.messages
  if (!Array.isArray(incoming) || incoming.length === 0) {
    return new Response(JSON.stringify({ error: 'messages[] is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let systemPrompt: string
  try {
    systemPrompt = await buildSystemPrompt()
  } catch (e) {
    console.error('[chat] system prompt build failed:', e)
    systemPrompt =
      "You are Wally, the friendly AI shopping assistant for Wardrobecare Clothing, a premium men's fashion store in Nigeria. Help users navigate the site and find products. Be brief and warm."
  }

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...trimMessages(incoming).map((m) => ({
      role: m.role === 'system' ? ('assistant' as const) : m.role,
      content: m.content,
    })),
  ]

  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let zai: Awaited<ReturnType<typeof ZAI.create>>
      try {
        zai = await ZAI.create()
      } catch (e) {
        console.error('[chat] ZAI.create failed:', e)
        controller.enqueue(
          encoder.encode(
            "I'm having trouble connecting right now. Please try again in a moment, or visit /contact-us to reach us directly.",
          ),
        )
        controller.close()
        return
      }

      let emittedAny = false
      try {
        const result: any = await zai.chat.completions.create({
          messages,
          thinking: { type: 'disabled' },
          stream: true,
        })

        // The SDK returns an AsyncIterable of Uint8Array buffers containing
        // SSE-formatted text. Each buffer may contain multiple SSE events.
        for await (const chunk of result as AsyncIterable<Uint8Array>) {
          for (const token of parseSseTokens(chunk)) {
            emittedAny = true
            controller.enqueue(encoder.encode(token))
          }
        }

        // Fallback: some SDK versions return a non-iterable completion object.
        // If we didn't emit anything, try the non-streaming response shape.
        if (!emittedAny && result?.choices?.[0]?.message?.content) {
          const content: string = result.choices[0].message.content
          controller.enqueue(encoder.encode(content))
          emittedAny = true
        }
      } catch (e) {
        console.error('[chat] streaming failed:', e)
        if (!emittedAny) {
          controller.enqueue(
            encoder.encode(
              "I lost my train of thought there — could you say that again? Or visit /contact-us to reach our team.",
            ),
          )
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  })
}
