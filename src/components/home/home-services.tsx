'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { SERVICES } from '@/lib/services-data'

const EASE = [0.16, 1, 0.3, 1] as const

export function HomeServices() {
  return (
    <section id="services" className="bg-[#121110] text-[#f7f6f3]">
      <div className="container-editorial py-20 md:py-28 lg:py-32">
        {/* ── Section header: headline left, intro right ── */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-end">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, ease: EASE }}
            className="lg:col-span-7"
          >
            <p className="eyebrow text-[#f7f6f3]/50 mb-6">What We Do</p>
            <h2 className="font-display text-[2rem] sm:text-4xl md:text-5xl lg:text-[3.4rem] leading-[1.08] tracking-[-0.015em] text-balance">
              Ways to build a wardrobe that actually fits your life.
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
            className="lg:col-span-5"
          >
            <p className="text-sm md:text-[15px] text-[#f7f6f3]/65 leading-relaxed max-w-sm lg:ml-auto">
              Every service starts with a conversation about how you live, work, and want to be
              seen — then we build from there.
            </p>
          </motion.div>
        </div>

        {/* ── Numbered service rows ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mt-14 md:mt-20 border-t border-white/12"
        >
          {SERVICES.map((service, i) => (
            <motion.div
              key={service.slug}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, delay: Math.min(i * 0.06, 0.3), ease: EASE }}
            >
              <Link
                href={`/services/${service.slug}`}
                className="group grid grid-cols-[auto_1fr_auto] md:grid-cols-[64px_minmax(0,5fr)_minmax(0,6fr)_auto] items-baseline gap-x-4 md:gap-x-8 py-6 md:py-8 border-b border-white/12 px-2 md:px-4 -mx-2 md:-mx-4 transition-colors duration-500 hover:bg-white/[0.04]"
              >
                {/* Number */}
                <span className="text-[11px] md:text-xs tabular-nums text-[#f7f6f3]/40 group-hover:text-[#f7f6f3]/70 transition-colors">
                  {service.number}
                </span>

                {/* Name */}
                <h3 className="font-display text-xl md:text-2xl lg:text-[1.7rem] leading-tight tracking-[-0.01em] group-hover:text-white transition-colors">
                  {service.name}
                </h3>

                {/* Description — desktop only */}
                <p className="hidden md:block text-[13px] leading-relaxed text-[#f7f6f3]/55 max-w-md">
                  {service.tagline}
                </p>

                {/* Price + action */}
                <div className="flex items-center gap-4 md:gap-6 justify-self-end">
                  <span className="hidden sm:inline-flex items-center border border-white/25 text-[10px] uppercase tracking-[0.14em] text-[#f7f6f3]/80 px-3 py-1.5 whitespace-nowrap">
                    {service.comingSoon ? 'Coming Soon' : service.priceLabel}
                  </span>
                  <span className="hidden lg:flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-[#f7f6f3]/60 group-hover:text-[#f7f6f3] transition-colors whitespace-nowrap">
                    Explore
                    <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </span>
                  <span className="lg:hidden text-[#f7f6f3]/40 group-hover:text-[#f7f6f3] transition-colors">
                    <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                  </span>
                </div>

                {/* Description — mobile, spans under name */}
                <p className="col-start-2 col-span-2 md:hidden text-[13px] leading-relaxed text-[#f7f6f3]/55 mt-1">
                  {service.tagline}
                </p>
                <span className="col-start-2 col-span-2 sm:hidden mt-3 inline-flex self-start items-center border border-white/25 text-[10px] uppercase tracking-[0.14em] text-[#f7f6f3]/80 px-3 py-1.5 w-fit">
                  {service.comingSoon ? 'Coming Soon' : service.priceLabel}
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Section CTAs ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mt-12 md:mt-16 flex flex-col sm:flex-row gap-3"
        >
          <Link
            href="/services"
            className="group inline-flex items-center justify-center gap-2.5 bg-[#f7f6f3] text-[#121110] px-8 py-4 text-[11px] uppercase tracking-[0.2em] hover:bg-white transition-colors"
          >
            Explore All Services
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/services?book=consultation"
            className="group inline-flex items-center justify-center gap-2.5 border border-white/40 text-[#f7f6f3] px-8 py-4 text-[11px] uppercase tracking-[0.2em] hover:bg-[#f7f6f3] hover:text-[#121110] hover:border-[#f7f6f3] transition-colors"
          >
            Book a Consultation
          </Link>
        </motion.div>

        {/* ── Editorial promos — guide + capsule builder ── */}
        <div className="mt-16 md:mt-24 grid md:grid-cols-2 gap-4 md:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, ease: EASE }}
            className="group border border-white/15 bg-white/[0.03] p-8 md:p-10 lg:p-12 flex flex-col transition-colors duration-500 hover:bg-white/[0.06]"
          >
            <p className="eyebrow text-[#f7f6f3]/45 mb-5">Coming Soon</p>
            <h3 className="font-display text-2xl md:text-3xl leading-tight tracking-[-0.01em]">
              The Nigerian Gentleman&apos;s Style Guide
            </h3>
            <p className="text-sm text-[#f7f6f3]/60 leading-relaxed mt-4 max-w-md">
              A complete, plain-English guide to fit, colour and dressing for every occasion —
              from Olawunmi&apos;s years of styling experience.
            </p>
            <Link
              href="/services?book=consultation"
              className="mt-8 md:mt-auto pt-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#f7f6f3]/80 group-hover:text-[#f7f6f3] transition-colors w-fit"
            >
              <span className="link-underline">Join the Waitlist</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, delay: 0.12, ease: EASE }}
            className="group border border-white/15 bg-white/[0.03] p-8 md:p-10 lg:p-12 flex flex-col transition-colors duration-500 hover:bg-white/[0.06]"
          >
            <p className="eyebrow text-[#f7f6f3]/45 mb-5">New</p>
            <h3 className="font-display text-2xl md:text-3xl leading-tight tracking-[-0.01em]">
              Capsule Wardrobe Builder
            </h3>
            <p className="text-sm text-[#f7f6f3]/60 leading-relaxed mt-4 max-w-md">
              Answer a few questions, get a capsule wardrobe plan built on your life — with a
              human stylist check when you need one.
            </p>
            <Link
              href="/services/style-wardrobe-consultation"
              className="mt-8 md:mt-auto pt-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#f7f6f3]/80 group-hover:text-[#f7f6f3] transition-colors w-fit"
            >
              <span className="link-underline">Learn More</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
