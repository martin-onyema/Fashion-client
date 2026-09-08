'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

type FeaturedProps = {
  title?: string
  subtitle?: string
  image?: string | null
  href?: string
}

export function FeaturedCollection({
  title = 'REFINED\nEVERYDAY',
  subtitle = 'Curated pieces for work, weekends, evenings and everything between.',
  image,
  href = '/shop',
}: FeaturedProps) {
  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-6 md:gap-10 items-stretch">
          {/* Image — left, larger */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 relative aspect-[4/5] md:aspect-[5/5] overflow-hidden bg-muted"
          >
            {image && (
              <Image
                src={image}
                alt="Featured collection"
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent" />
          </motion.div>

          {/* Typography — right */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex flex-col justify-between bg-secondary/60 p-8 md:p-12 lg:p-16"
          >
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-6">
                03 · Featured Collection
              </p>
              <h2 className="font-display text-4xl md:text-6xl lg:text-7xl leading-[0.95] tracking-[-0.02em] whitespace-pre-line">
                {title}
              </h2>
              <p className="text-base text-muted-foreground mt-8 max-w-md leading-relaxed">
                {subtitle}
              </p>
            </div>

            <div className="mt-12">
              <Link
                href={href}
                className="group inline-flex items-center gap-3 bg-foreground text-background px-8 py-4 text-[11px] uppercase tracking-[0.2em] hover:bg-foreground/90 transition-colors"
              >
                Shop the Collection
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
