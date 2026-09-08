'use client'

import { motion } from 'framer-motion'

const EASE = [0.16, 1, 0.3, 1] as const

type ShopIntroProps = {
  note?: string
}

export function ShopIntro({ note }: ShopIntroProps) {
  return (
    <section className="bg-background">
      <div className="container-editorial pt-20 md:pt-28 pb-14 md:pb-20 text-center">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: EASE }}
          className="eyebrow text-foreground/50 mb-5"
        >
          Shop
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
          className="font-display text-3xl sm:text-4xl md:text-5xl leading-[1.1] tracking-[-0.015em] text-balance max-w-2xl mx-auto"
        >
          Prefer to shop it yourself? The edit is below.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
          className="text-sm text-foreground/55 leading-relaxed max-w-md mx-auto mt-6"
        >
          {note ??
            'Every piece is stocked in Lagos and delivered nationwide — with styling advice a message away.'}
        </motion.p>
      </div>
    </section>
  )
}
