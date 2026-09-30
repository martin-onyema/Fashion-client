'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Instagram, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

type InstagramSectionProps = {
  images?: string[]
  handle?: string
  title?: string
  cta?: string
}

export function InstagramSection({
  images = [],
  handle = 'wardrobecareng',
  title = '@wardrobecareng',
  cta = 'Follow the journey',
}: InstagramSectionProps) {
  const grid = images.length ? images : [
    'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=600&auto=format&fit=crop',
  ]

  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="eyebrow text-foreground/50 mb-3"
            >
              Community
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-display text-4xl md:text-6xl lg:text-7xl leading-[1] tracking-[-0.02em]"
            >
              {title}
            </motion.h2>
          </div>
          <a
            href={`https://www.instagram.com/${handle.replace('@', '')}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 mt-6 md:mt-0 text-[11px] uppercase tracking-[0.2em]"
          >
            <Instagram className="h-4 w-4" strokeWidth={1.5} />
            {cta}
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
          {grid.slice(0, 6).map((img, i) => (
            <motion.a
              key={i}
              href={`https://www.instagram.com/${handle.replace('@', '')}/`}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="relative aspect-square overflow-hidden bg-muted group"
            >
              <Image
                src={img}
                alt={`Wardrobecare Instagram ${i + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors duration-300 flex items-center justify-center">
                <Instagram className="h-6 w-6 text-background opacity-0 group-hover:opacity-100 transition-opacity duration-300" strokeWidth={1.5} />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}
