/**
 * Wardrobecare Services — static catalogue.
 *
 * Services are content-driven, not user-editable, so we keep them in code
 * (not the database). Enquiries against services ARE stored in the DB
 * (see `ServiceEnquiry` Prisma model).
 *
 * To edit a service: update this file. To add a new service: append to the
 * array — the sitemap, nav mega-menu, /services grid and /services/[slug]
 * route will all pick it up automatically.
 */

export type ServiceCategory = 'Sourcing' | 'Diagnostic' | 'In-Home' | 'Gifting' | 'Cultural'

export type ServiceFaq = {
  q: string
  a: string
}

export type Service = {
  /** URL slug — also stored on ServiceEnquiry rows. */
  slug: string
  /** Display number, e.g. "01". */
  number: string
  /** High-level category — used for grouping on /services. */
  category: ServiceCategory
  /** Service name. */
  name: string
  /** Short tagline used on cards. */
  tagline: string
  /** Longer description used on the service page hero. */
  description: string
  /** Premium lifestyle image — Unsplash CDN. */
  image: string
  /** Image alt text. */
  imageAlt: string
  /** Starting price in NGN, numeric (e.g. 45000). */
  startingPrice: number
  /** Human-readable price label, e.g. "From ₦45,000". */
  priceLabel: string
  /** Pricing unit, e.g. "Per trip", "Per session". */
  priceUnit: string
  /** One-line pricing note shown below the price. */
  priceNote?: string
  /** "Who it's for" bullets. */
  whoFor: string[]
  /** "What's included / How it works" — numbered steps or bullets. */
  whatsIncluded: { step?: string; title: string; body: string }[]
  /** Testimonial / social proof. */
  testimonial?: { quote: string; author: string; role: string }
  /** FAQ list. */
  faqs: ServiceFaq[]
  /** Final CTA copy. */
  finalCta: { title: string; body: string; button: string }
  /** Whether to feature on homepage (4 featured services). */
  featured: boolean
}

export const SERVICES: Service[] = [
  {
    slug: 'personal-shopping',
    number: '01',
    category: 'Sourcing',
    name: 'Personal Shopping',
    tagline: 'We shop for you, sourcing pieces to your brief, budget, taste, and occasion.',
    description:
      'Give us the brief — occasion, budget, taste — and we shop for you. You review a curated shortlist and only pay for what you keep.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1600&auto=format&fit=crop',
    imageAlt: 'A curated rail of premium menswear pieces styled for a personal shopping brief',
    startingPrice: 45000,
    priceLabel: 'From ₦45,000',
    priceUnit: 'Per trip',
    priceNote: 'Styling fee per trip · sourcing cost separate',
    featured: true,
    whoFor: [
      "You know what you need but don't have time to shop for it",
      'You want options curated to your taste, not endless scrolling',
      "You're shopping for a specific gap in your wardrobe",
      "You'd rather review a shortlist than browse a full store",
    ],
    whatsIncluded: [
      { step: '01', title: 'Brief', body: 'Tell us what you need, your budget, and your sizing.' },
      { step: '02', title: 'Sourcing', body: 'We pull options across our vetted network of suppliers.' },
      { step: '03', title: 'Shortlist', body: 'You review a curated set and approve what to purchase.' },
    ],
    testimonial: {
      quote:
        'I needed three outfits for a work trip and didn\'t have time to leave the office. They delivered a shortlist the next morning. I kept everything.',
      author: 'Tunde A.',
      role: 'Investment banker, Lagos',
    },
    faqs: [
      { q: 'Do I have to buy everything shortlisted?', a: 'No. You only pay for what you decide to keep. The styling fee covers our time sourcing and curating — not the items themselves.' },
      { q: 'Can this be done without meeting in person?', a: 'Yes. We work over WhatsApp and email. You can review the shortlist digitally and approve remotely.' },
      { q: 'Do you source from outside Lagos?', a: 'Yes — we have supplier relationships across Lagos, Abuja, and internationally. Sourcing lead time depends on the brief.' },
    ],
    finalCta: {
      title: 'Send us your brief — we\'ll do the shopping.',
      body: 'Tell us what you need, when you need it, and the budget you\'re working with. We\'ll come back with a shortlist within 48 hours.',
      button: 'Start Your Brief',
    },
  },

  {
    slug: 'style-consultation',
    number: '02',
    category: 'Diagnostic',
    name: 'Style Consultation',
    tagline: 'Define your personal style direction with a focused consultation built around how you want to dress.',
    description:
      'A focused, 90-minute consultation that defines your style direction — what works for your body, your life, and the impression you want to leave.',
    image: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?q=80&w=1600&auto=format&fit=crop',
    imageAlt: 'A man reviewing a curated style moodboard during a style consultation',
    startingPrice: 35000,
    priceLabel: 'From ₦35,000',
    priceUnit: '1 session',
    priceNote: '90-minute consultation · in-person or video call',
    featured: true,
    whoFor: [
      'You feel stuck in a style rut and want a clearer direction',
      "You're transitioning roles — new job, new industry, new city",
      'You want a defined palette, silhouette, and aesthetic to shop against',
      "You've never had a style framework and want to start with one",
    ],
    whatsIncluded: [
      { step: '01', title: 'Questionnaire', body: 'You complete a short style + lifestyle questionnaire before the session.' },
      { step: '02', title: 'Consultation', body: 'A 90-minute conversation — what you wear now, what you want to wear, what\'s holding you back.' },
      { step: '03', title: 'Style Direction', body: 'You leave with a defined style direction: palette, silhouette, references, and shopping priorities.' },
    ],
    testimonial: {
      quote:
        'I\'d been wearing the same three outfits for years. One session gave me a framework I still use every time I shop.',
      author: 'Femi O.',
      role: 'Tech founder, Lagos',
    },
    faqs: [
      { q: 'Is this in person or virtual?', a: 'Both options are available. The virtual session is just as effective — we use a shared moodboard throughout.' },
      { q: 'Do I need to prepare anything?', a: 'Just the questionnaire we send on booking. Photos of three outfits you love and three you don\'t also help, but aren\'t required.' },
      { q: 'Can I extend this into a full wardrobe overhaul?', a: 'Yes. Many clients use the Style Consultation as the diagnostic before booking a full Wardrobe Consultation.' },
    ],
    finalCta: {
      title: 'Define your style direction in one session.',
      body: 'A 90-minute consultation that gives you a clear, defensible framework for every future purchase.',
      button: 'Book a Consultation',
    },
  },

  {
    slug: 'wardrobe-consultation',
    number: '03',
    category: 'Diagnostic',
    name: 'Wardrobe Consultation',
    tagline: 'Review what you own, identify what is missing, and create a clearer, more intentional wardrobe.',
    description:
      'A full wardrobe audit — we review what you own, identify gaps, and build a 12-month shopping plan that fills your wardrobe with intention, not impulse.',
    image: 'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?q=80&w=1600&auto=format&fit=crop',
    imageAlt: 'A neatly organised wardrobe after a wardrobe consultation',
    startingPrice: 75000,
    priceLabel: 'From ₦75,000',
    priceUnit: '1 session',
    priceNote: 'On-site wardrobe audit · written report included',
    featured: false,
    whoFor: [
      'You have a full wardrobe but nothing to wear',
      'You want to invest in fewer, better pieces',
      "You're rebuilding your wardrobe after a major life change",
      'You want a shopping plan, not just a cleanout',
    ],
    whatsIncluded: [
      { step: '01', title: 'Audit', body: 'We visit your wardrobe (Lagos) or review photos (elsewhere) and assess every piece.' },
      { step: '02', title: 'Edit', body: 'Together we decide what stays, what to alter, what to retire, and what\'s missing.' },
      { step: '03', title: 'Plan', body: 'You receive a written 12-month shopping plan — gaps, priorities, budget ranges, and recommended brands.' },
    ],
    testimonial: {
      quote:
        'They pulled out twenty pieces I hadn\'t worn in two years and showed me why. The wardrobe I have now is half the size and twice as useful.',
      author: 'Chidi N.',
      role: 'Lawyer, Abuja',
    },
    faqs: [
      { q: 'Do I have to throw things away?', a: 'No. We advise, you decide. Everything we suggest is a recommendation — the final call is always yours.' },
      { q: 'Is this only for Lagos clients?', a: 'In-person audits are Lagos only. For clients elsewhere, we run the same process with photographs and a video call.' },
      { q: 'Does the shopping plan include specific products?', a: 'Yes — gaps are matched to specific brands, price points, and where to source them in Nigeria or internationally.' },
    ],
    finalCta: {
      title: 'A wardrobe that works for the life you have now.',
      body: 'Stop buying things that don\'t get worn. Let\'s rebuild your wardrobe with intention.',
      button: 'Book a Wardrobe Consultation',
    },
  },

  {
    slug: 'home-fitting',
    number: '04',
    category: 'In-Home',
    name: 'Home Fitting',
    tagline: 'We bring the fitting experience to your home or office, so you can try, measure, and decide without leaving your schedule.',
    description:
      'We bring the try-on to you — at home or in the office — so you\'re fitted, measured, and decided without leaving your schedule behind.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1600&auto=format&fit=crop',
    imageAlt: 'A home fitting session with a curated rail of menswear laid out for the client',
    startingPrice: 60000,
    priceLabel: 'From ₦60,000',
    priceUnit: 'Per visit',
    priceNote: 'Per visit · Lagos mainland & island',
    featured: true,
    whoFor: [
      'You don\'t have time to visit a store',
      'You want pieces tried on in your actual environment and lighting',
      'You need accurate measurements for tailoring or made-to-measure',
      'You\'re buying for an event and want certainty on fit before the day',
    ],
    whatsIncluded: [
      { title: 'On-site visit at your home or office', body: 'Within Lagos mainland and island. Outside Lagos available on request.' },
      { title: 'Full measurements taken and recorded', body: 'We measure once and keep your record for future orders.' },
      { title: 'Try-on of shortlisted or sourced pieces', body: 'A curated rail of pieces to try — yours to keep or return on the spot.' },
      { title: 'On-the-spot fit notes for tailoring', body: 'If anything needs adjusting, we brief the tailor before we leave.' },
    ],
    testimonial: {
      quote:
        'I had three back-to-back meetings and didn\'t want to lose the afternoon to a tailor. They came to my office. Fitted, measured, done in 45 minutes.',
      author: 'David K.',
      role: 'Managing director, Lagos',
    },
    faqs: [
      { q: 'How long does a visit take?', a: 'Typically 45–90 minutes depending on the number of pieces. We confirm timing when we schedule.' },
      { q: 'Do I need to have my own pieces?', a: 'No — we can bring a curated rail based on your brief, or fit pieces you already own.' },
      { q: 'Do you offer fittings outside Lagos?', a: 'Yes, with a travel surcharge. Select this on the enquiry form and we\'ll quote separately.' },
    ],
    finalCta: {
      title: 'We come to you.',
      body: 'Book a home or office fitting. We bring the rail, take your measurements, and leave you certain.',
      button: 'Book a Home Visit',
    },
  },

  {
    slug: 'premium-sourcing',
    number: '05',
    category: 'Sourcing',
    name: 'Premium Sourcing',
    tagline: 'Access rare, exceptional, and hard-to-find luxury pieces through our sourcing network.',
    description:
      'For pieces that aren\'t on the shelf — limited drops, archive finds, made-to-measure, and international luxury. We work our network on your behalf.',
    image: 'https://images.unsplash.com/photo-1614253429340-98120bd6d753?q=80&w=1600&auto=format&fit=crop',
    imageAlt: 'A display of rare luxury menswear accessories sourced through a premium network',
    startingPrice: 100000,
    priceLabel: 'From ₦100,000',
    priceUnit: 'Per item',
    priceNote: 'Sourcing fee · item cost separate',
    featured: false,
    whoFor: [
      "You're looking for something specific and can't find it",
      'You want archive or limited-edition pieces',
      "You're buying internationally and want trusted in-country sourcing",
      'You need made-to-measure from a specific atelier',
    ],
    whatsIncluded: [
      { step: '01', title: 'Brief', body: 'You describe the piece — brand, era, size, budget, deadline.' },
      { step: '02', title: 'Search', body: 'We activate our network of dealers, ateliers, and international contacts.' },
      { step: '03', title: 'Verify', body: 'Every sourced piece comes with provenance and authenticity documentation.' },
    ],
    testimonial: {
      quote:
        'I\'d been looking for a specific archive piece for three years. They found it in eleven days, with full provenance. I still can\'t quite believe it.',
      author: 'Emeka O.',
      role: 'Collector, Lagos',
    },
    faqs: [
      { q: 'What can you source?', a: 'Most categories of premium menswear: tailoring, footwear, leather goods, accessories, fragrance. If it exists, we can usually find it.' },
      { q: 'How does authentication work?', a: 'Every sourced piece comes with documented provenance. For luxury items, we use certified authenticators.' },
      { q: 'What\'s the lead time?', a: 'Depending on rarity, 2–8 weeks. We confirm expected timelines in your sourcing brief before you commit.' },
    ],
    finalCta: {
      title: 'Tell us what you\'re looking for.',
      body: 'If it exists, we can usually find it. Send us the brief — brand, era, size, budget, deadline — and we\'ll work our network.',
      button: 'Enquire About This Service',
    },
  },

  {
    slug: 'outfit-gifting',
    number: '06',
    category: 'Gifting',
    name: 'Outfit Gifting',
    tagline: 'Give someone a complete, thoughtfully styled outfit curated around their taste, size, and occasion.',
    description:
      'A complete styled outfit, curated around the recipient\'s taste and size, delivered for a birthday, anniversary, wedding, or just because.',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1600&auto=format&fit=crop',
    imageAlt: 'A beautifully wrapped gift box containing a styled menswear outfit',
    startingPrice: 80000,
    priceLabel: 'From ₦80,000',
    priceUnit: 'Per gift',
    priceNote: 'Styling + gift wrapping · item cost separate',
    featured: false,
    whoFor: [
      'You want to gift clothing but don\'t know their size or taste',
      'You want a complete outfit, not just a single piece',
      'You want it beautifully presented',
      'You\'re gifting for a specific occasion — wedding, birthday, anniversary',
    ],
    whatsIncluded: [
      { step: '01', title: 'Recipient Brief', body: 'You tell us about them — taste, size if known, occasion, budget.' },
      { step: '02', title: 'Curate', body: 'We assemble a complete outfit (e.g. shirt + trousers + accessory) around the brief.' },
      { step: '03', title: 'Present', body: 'Premium gift-wrapped and delivered with a handwritten note.' },
    ],
    testimonial: {
      quote:
        'I gifted my brother a full outfit for his 30th. They handled everything — sizing, styling, wrapping, delivery. He still talks about it.',
      author: 'Ngozi M.',
      role: 'Gifting client, Lagos',
    },
    faqs: [
      { q: 'What if it doesn\'t fit?', a: 'All gifting outfits include one free size exchange within 7 days of delivery.' },
      { q: 'Can you deliver on a specific date?', a: 'Yes — specify the date in the brief and we\'ll confirm scheduling before you pay.' },
      { q: 'Can I see the outfit before it\'s delivered?', a: 'Yes. We can send a preview for your approval, or deliver as a complete surprise.' },
    ],
    finalCta: {
      title: 'Give a wardrobe moment, not just a gift.',
      body: 'A complete styled outfit, beautifully presented. Tell us who it\'s for and we\'ll handle the rest.',
      button: 'Plan a Gift',
    },
  },

  {
    slug: 'traditional-wear-consultation',
    number: '07',
    category: 'Cultural',
    name: 'Traditional Wear Consultation',
    tagline: 'Agbada, kaftan, senator, and ceremonial wear — styled correctly for the occasion, culture, and your build.',
    description:
      'Agbada, kaftan, senator, and ceremonial wear — styled correctly for the occasion, the culture, and your build. We coordinate fabric, accessories, and tailoring.',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1600&auto=format&fit=crop',
    imageAlt: 'A finely tailored agbada displayed for a traditional wear consultation',
    startingPrice: 120000,
    priceLabel: 'From ₦120,000',
    priceUnit: 'Per occasion',
    priceNote: 'Per occasion · fabric & tailoring costs separate',
    featured: true,
    whoFor: [
      'You have a wedding, chieftaincy, or ceremonial event coming up',
      'You want traditional wear styled correctly for your culture',
      'You want to coordinate looks with family or an entourage',
      'You want the right fabric, cap, and accessories paired together',
    ],
    whatsIncluded: [
      { title: 'Occasion & cultural briefing', body: 'We start with the event, the culture, and your role in it.' },
      { title: 'Fabric and cap/accessory pairing guidance', body: 'Fabric choices, cap pairing, beads, shoes — every element considered.' },
      { title: 'Tailor referral for made-to-measure pieces', body: 'We refer trusted ateliers for agbada, kaftan, and senator styles.' },
      { title: 'Coordination with family or entourage looks', body: 'If others are dressing with you, we coordinate so the looks read as one.' },
    ],
    testimonial: {
      quote:
        'My father\'s chieftaincy was a once-in-a-lifetime event. They styled all four of us — me, my brothers, and my dad — and every detail was right.',
      author: 'Kunle A.',
      role: 'Chieftaincy client, Ibadan',
    },
    faqs: [
      { q: 'Do you provide the fabric?', a: 'We can. We also work with fabric you provide — particularly if it\'s a family piece or culturally significant.' },
      { q: 'Which cultures do you cover?', a: 'All major Nigerian ceremonial traditions — Yoruba, Igbo, Hausa, Benin, and more. Brief us on the specific occasion and we\'ll confirm.' },
      { q: 'How far ahead should I book?', a: 'For made-to-measure pieces, 4–6 weeks minimum. For styling only, 2 weeks is usually enough.' },
    ],
    finalCta: {
      title: 'Style your next occasion correctly.',
      body: 'Whether it\'s a wedding, a chieftaincy, or a naming ceremony — book a consultation and we\'ll style it right.',
      button: 'Book a Consultation',
    },
  },
]

// ---- Groupings shown on /services ----

export type ServiceGroup = {
  label: string
  description: string
  services: Service[]
}

export const SERVICE_GROUPS: ServiceGroup[] = [
  {
    label: 'Sourcing',
    description: 'We find it, you approve it.',
    services: SERVICES.filter((s) => s.category === 'Sourcing'),
  },
  {
    label: 'Consultations',
    description: 'Define, audit, and direct your style.',
    services: SERVICES.filter((s) => s.category === 'Diagnostic' || s.category === 'Cultural'),
  },
  {
    label: 'Standalone',
    description: 'One-off services for a specific moment.',
    services: SERVICES.filter((s) => s.category === 'In-Home' || s.category === 'Gifting'),
  },
]

// ---- Helpers ----

export function getServiceBySlug(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug)
}

export function getFeaturedServices(): Service[] {
  return SERVICES.filter((s) => s.featured)
}

export function getRelatedServices(currentSlug: string, limit = 3): Service[] {
  const current = getServiceBySlug(currentSlug)
  if (!current) return SERVICES.slice(0, limit)
  // Same category first, then fill from the rest
  const sameCategory = SERVICES.filter((s) => s.slug !== currentSlug && s.category === current.category)
  const others = SERVICES.filter((s) => s.slug !== currentSlug && s.category !== current.category)
  return [...sameCategory, ...others].slice(0, limit)
}
