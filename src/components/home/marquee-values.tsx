'use client'

import { motion } from 'framer-motion'

const VALUES = [
  { label: 'Personal Shopping', desc: 'Curated menswear, hand-picked with intent.' },
  { label: 'Premium Quality', desc: 'Materials and construction that earn their place.' },
  { label: 'Delivered Nationwide', desc: 'Across Nigeria, with care.' },
]

export function MarqueeValues() {
  return (
    <section className="border-y border-border bg-background py-10 md:py-14 overflow-hidden">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {VALUES.map((v, i) => (
            <motion.div
              key={v.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="flex items-start gap-4 md:gap-6"
            >
              <span className="text-[11px] tabular-nums text-muted-foreground mt-1">
                0{i + 1}
              </span>
              <div>
                <h3 className="font-display text-lg md:text-xl leading-tight">
                  {v.label}
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  {v.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
