'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const EASE = [0.16, 1, 0.3, 1] as const

type HeroProps = {
  title?: string
  subtitle?: string
  image?: string | null
  primaryCta?: string
  primaryHref?: string
  secondaryCta?: string
  secondaryHref?: string
}

export function HomeHero({
  title = 'A service built around your style.',
  subtitle = 'Personal shopping, wardrobe consultations, home fittings and more — guided by a real stylist, built around how you live and dress.',
  image,
  primaryCta = 'Explore Services',
  primaryHref = '/services',
  secondaryCta = 'Shop Pieces',
  secondaryHref = '/shop',
}: HeroProps) {
  const words = title.split(' ')

  return (
    <section className="relative h-[86vh] min-h-[560px] md:min-h-[640px] w-full overflow-hidden bg-foreground">
      {/* Full-bleed editorial image */}
      {image && (
        <motion.div
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease: EASE }}
          className="absolute inset-0"
        >
          <Image
            src={image}
            alt="Wardrobecare editorial"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center img-editorial"
          />
          {/* Monochrome legibility gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-transparent" />
        </motion.div>
      )}

      {/* Content — bottom-left editorial stack */}
      <div className="relative h-full">
        <div className="container-editorial h-full flex items-end pb-16 md:pb-24">
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-white/75 mb-5 md:mb-7"
            >
              Wardrobecare Clothing · Lagos, Nigeria · Est. 2003
            </motion.p>

            {/* Serif display headline */}
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: EASE }}
              className="font-display text-white text-[2.75rem] sm:text-6xl md:text-7xl lg:text-[5.25rem] leading-[1.02] tracking-[-0.015em] text-balance"
            >
              {words.map((word, i) => (
                <span key={i} className="inline-block mr-[0.26em] last:mr-0">
                  {word}
                </span>
              ))}
            </motion.h1>

            {/* Supporting copy */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55 }}
              className="text-white/80 text-[15px] md:text-base mt-5 md:mt-7 max-w-md leading-relaxed"
            >
              {subtitle}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.75 }}
              className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-3"
            >
              <Link
                href={primaryHref}
                className="group inline-flex items-center justify-center gap-2.5 bg-white text-foreground px-8 py-4 text-[11px] uppercase tracking-[0.2em] hover:bg-white/90 transition-colors"
              >
                {primaryCta}
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href={secondaryHref}
                className="group inline-flex items-center justify-center gap-2.5 border border-white/50 text-white px-8 py-4 text-[11px] uppercase tracking-[0.2em] hover:bg-white hover:text-foreground hover:border-white transition-colors"
              >
                {secondaryCta}
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="absolute bottom-6 right-6 lg:right-10 hidden md:flex flex-col items-center gap-3"
      >
        <span className="text-[9px] uppercase tracking-[0.3em] text-white/60 [writing-mode:vertical-rl]">
          Scroll to explore
        </span>
        <span className="w-px h-12 bg-white/30 relative overflow-hidden">
          <span className="absolute top-0 left-0 w-full h-1/2 bg-white animate-[scrollHint_2s_ease-in-out_infinite]" />
        </span>
      </motion.div>
    </section>
  )
}
