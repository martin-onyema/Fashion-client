// Test z-ai SDK streaming
import ZAI from 'z-ai-web-dev-sdk'

async function main() {
  const zai = await ZAI.create()
  console.log('Calling create with stream:true')
  const result: any = await zai.chat.completions.create({
    messages: [
      { role: 'user', content: 'Say "hello world" in one sentence.' },
    ],
    thinking: { type: 'disabled' },
    stream: true,
  })
  console.log('Type of result:', typeof result)
  console.log('Is iterable?', Symbol.asyncIterator in (result || {}))
  console.log('Result keys:', Object.keys(result || {}))
  if (result?.choices?.[0]) {
    console.log('Non-streaming response shape — choices[0]:', JSON.stringify(result.choices[0]).slice(0, 300))
  }
  // Try async iteration
  try {
    let count = 0
    let allBytes = Buffer.alloc(0)
    for await (const chunk of result) {
      count++
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
      allBytes = Buffer.concat([allBytes, buf])
      if (count <= 3) {
        console.log(`  chunk ${count} (len=${buf.length}):`, buf.toString('utf8').slice(0, 200))
      }
    }
    console.log('Total chunks:', count, 'total bytes:', allBytes.length)
    console.log('Full text:')
    console.log(allBytes.toString('utf8').slice(0, 2000))
  } catch (e) {
    console.error('Iteration failed:', e.message)
    // Fallback: maybe result is a regular completion
    if (result?.choices?.[0]?.message) {
      console.log('Fallback — got message:', result.choices[0].message.content?.slice(0, 200))
    }
  }
}

main().catch((e) => {
  console.error('FAILED:', e)
  process.exit(1)
})
