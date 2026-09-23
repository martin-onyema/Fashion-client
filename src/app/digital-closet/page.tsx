import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { DigitalClosetContent } from './digital-closet-content'

export const metadata: Metadata = {
  title: 'Digital Closet & Capsule Wardrobe',
  description:
    'Coming soon — the Wardrobecare Digital Closet. Hold and organize what you own, get capsule combinations from your real pieces, and find the gaps. One annual subscription, tied to your Wardrobe & Style Consultation or started fresh.',
}

export default function DigitalClosetPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <DigitalClosetContent />
      </main>
      <Footer />
    </>
  )
}
