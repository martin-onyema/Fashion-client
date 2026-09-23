/**
 * Wardrobecare Services — static catalogue.
 *
 * Services are content-driven, not user-editable, so we keep them in code
 * (not the database). Enquiries against services ARE stored in the DB
 * (see `ServiceEnquiry` Prisma model).
 *
 * `comingSoon: true` marks a service that is announced but not bookable yet:
 * it is hidden from the bookable lists (book CTAs, enquiry form dropdown),
 * labelled "Coming soon" across the site, and its detail page shows a
 * waitlist panel instead of a booking flow.
 *
 * To edit a service: update this file. To add a new service: append to the
 * array — the sitemap, nav mega-menu, /services grid and /services/[slug]
 * route will all pick it up automatically.
 */

export type ServiceCategory = 'Sourcing' | 'Diagnostic' | 'In-Home' | 'Gifting' | 'Cultural' | 'Tailoring'

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
  /** Premium lifestyle image — self-hosted under /services. */
  image: string
  /** Optional art-directed portrait image for the mobile hero (≤767px viewports). */
  imageMobile?: string
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
  /** Announced but not bookable yet — renders with a "Coming Soon" state. */
  comingSoon?: boolean
  /** Optional itemised price table (e.g. per-alteration or box-tier pricing). */
  pricingTable?: {
    /** Small heading above the table, e.g. "Pricing & Packaging". */
    title?: string
    /** Small sub-line under the title. */
    subtitle?: string
    /** Each row — label left, amount right. */
    rows: { label: string; amount: string }[]
    /** Optional sub-heading between row groups. */
    groupLabel?: string
    /** Optional second row group (e.g. additional boxes). */
    groupRows?: { label: string; amount: string }[]
    /** Mandatory fee banner rendered under the table. */
    feeBanner?: { title: string; body: string; amount: string }
    /** Small print notes under the table. */
    notes?: { lead: string; body: string }[]
  }
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
    image: '/services/personal-shopping-m.jpg',
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
    slug: 'style-wardrobe-consultation',
    number: '02',
    category: 'Diagnostic',
    name: 'Style & Wardrobe Consultation',
    tagline: 'Define your style direction and rebuild your wardrobe around it — one consultation, a clear plan.',
    description:
      'A focused consultation that defines your style direction, then goes further — auditing what you own, identifying the gaps, and building a 12-month shopping plan that fills your wardrobe with intention, not impulse.',
    image: '/services/style-wardrobe-consultation.jpg',
    imageAlt: 'A style and wardrobe consultation in progress with a curated moodboard and organised wardrobe',
    startingPrice: 75000,
    priceLabel: 'From ₦75,000',
    priceUnit: '1 session',
    priceNote: '90-minute consultation · wardrobe audit & written plan included',
    featured: true,
    whoFor: [
      'You feel stuck in a style rut and want a clearer direction',
      'You have a full wardrobe but nothing to wear',
      "You're transitioning roles — new job, new industry, new city",
      'You want a defined palette and silhouette, and a plan to shop against',
      "You're rebuilding your wardrobe after a major life change",
    ],
    whatsIncluded: [
      { step: '01', title: 'Questionnaire', body: 'You complete a short style + lifestyle questionnaire before the session.' },
      { step: '02', title: 'Consultation', body: 'A 90-minute conversation — what you wear now, what you want to wear, what\'s holding you back.' },
      { step: '03', title: 'Wardrobe Audit', body: 'We review what you own (in person in Lagos, or by photos elsewhere) and decide what stays, what goes, and what\'s missing.' },
      { step: '04', title: 'Style Direction & Plan', body: 'You leave with a defined style direction and a written 12-month shopping plan — palette, silhouette, gaps, priorities, and budget ranges.' },
    ],
    testimonial: {
      quote:
        'They pulled out twenty pieces I hadn\'t worn in two years and showed me why. One session gave me a framework — the wardrobe I have now is half the size and twice as useful.',
      author: 'Chidi N.',
      role: 'Lawyer, Abuja',
    },
    faqs: [
      { q: 'Is this in person or virtual?', a: 'Both options are available. The consultation itself works over video; the wardrobe audit can be done in person (Lagos) or with photographs and a video call.' },
      { q: 'Do I have to throw things away?', a: 'No. We advise, you decide. Everything we suggest is a recommendation — the final call is always yours.' },
      { q: 'Does the shopping plan include specific products?', a: 'Yes — gaps are matched to specific brands, price points, and where to source them in Nigeria or internationally.' },
    ],
    finalCta: {
      title: 'A wardrobe that works for the life you have now.',
      body: 'Define your direction, edit what you own, and shop with intention from here on.',
      button: 'Book a Consultation',
    },
  },

  {
    slug: 'home-fitting',
    number: '03',
    category: 'In-Home',
    name: 'Home Fitting',
    tagline: 'We bring the fitting experience to your home or office, so you can try, measure, and decide without leaving your schedule.',
    description:
      'We bring the try-on to you — at home or in the office — so you\'re fitted, measured, and decided without leaving your schedule behind.',
    image: '/services/home-fitting-m.jpg',
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
    number: '04',
    category: 'Sourcing',
    name: 'Premium Sourcing',
    tagline: 'Access rare, exceptional, and hard-to-find luxury pieces through our sourcing network.',
    description:
      'For pieces that aren\'t on the shelf — limited drops, archive finds, made-to-measure, and international luxury. We work our network on your behalf.',
    image: '/services/premium-sourcing.jpg',
    imageAlt: 'A display of rare luxury menswear accessories sourced through a premium network',
    startingPrice: 100000,
    priceLabel: 'From ₦100,000',
    priceUnit: 'Per item',
    priceNote: 'Sourcing fee · item cost separate',
    featured: false,
    comingSoon: true,
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
      button: 'Join the Waitlist',
    },
  },

  {
    slug: 'outfit-gifting',
    number: '05',
    category: 'Gifting',
    name: 'Outfit Gifting',
    tagline: 'Give someone a complete, thoughtfully styled outfit curated around their taste, size, and occasion.',
    description:
      'A fully styled outfit, curated for someone else, gift-wrapped and delivered — for the men in your life who dress well, or who you want to dress well.',
    image: '/services/outfit-gifting-m.jpg',
    imageAlt: 'A beautifully wrapped gift box containing a styled menswear outfit',
    startingPrice: 40000,
    priceLabel: 'From ₦40,000',
    priceUnit: 'Per gift',
    priceNote: 'Styling & gift wrap · outfit cost separate',
    featured: false,
    whoFor: [
      'You want to gift clothing but don\'t know their size or taste',
      'You want a complete outfit, not just a single piece',
      'You want it beautifully presented',
      'You\'re gifting for a specific occasion — wedding, birthday, anniversary',
    ],
    whatsIncluded: [
      { step: '01', title: 'Tell Us About Him', body: 'His sizes if known, his style, the occasion, and your budget. A two-minute brief is enough.' },
      { step: '02', title: 'We Style It', body: 'A complete outfit is curated around the brief, gift-wrapped with your handwritten note — preview approval available.' },
      { step: '03', title: 'Delivered', body: 'Sent directly to him, or to you first if you would rather present it yourself. Date-specific delivery confirmed before you pay.' },
    ],
    testimonial: {
      quote:
        'I gifted my brother a full outfit for his 30th. They handled everything — sizing, styling, wrapping, delivery. He still talks about it.',
      author: 'Ngozi M.',
      role: 'Gifting client, Lagos',
    },
    pricingTable: {
      title: 'Pricing & Packaging',
      rows: [
        { label: 'Styling & gift wrap (includes first box — small or medium)', amount: '₦40,000' },
        { label: 'First box upgraded to large', amount: '+₦10,000' },
      ],
      groupLabel: 'Additional Boxes (multiple outfits / categories)',
      groupRows: [
        { label: 'Small', amount: '₦10,000' },
        { label: 'Medium', amount: '₦20,000' },
        { label: 'Large', amount: '₦30,000' },
      ],
      notes: [
        {
          lead: 'Outfit cost is separate from the styling fee.',
          body: 'Standard delivery is priced by location — see Shipping. Bulk orders (multiple boxes) or far locations needing a vehicle are assessed case by case and confirmed before checkout.',
        },
      ],
    },
    faqs: [
      { q: 'Can I buy an outfit as a gift for someone else?', a: 'Yes — we style a complete outfit, gift-wrap it, and deliver it, ready to give.' },
      { q: 'What if I don\'t know their size?', a: 'We\'ll walk you through practical ways to figure that out before anything\'s bought.' },
      { q: 'Can I include a personal message?', a: 'Yes — a note can be included with the delivery.' },
      { q: 'Does packaging cost extra?', a: 'The styling fee includes packing and your first box, as long as it\'s small or medium. A large first box adds ₦10,000. If you\'re gifting more than one outfit, each additional box is priced by size — ₦10,000 small, ₦20,000 medium, ₦30,000 large.' },
      { q: 'Can I gift more than one outfit at once?', a: 'Yes — each additional outfit that needs its own box is priced as an additional box (see the pricing table above). Delivery for larger multi-box orders is assessed separately rather than the standard per-location fee.' },
      { q: 'What if it doesn\'t fit?', a: 'All gifting outfits include one free size exchange within 7 days of delivery.' },
      { q: 'Can you deliver on a specific date?', a: 'Yes — specify the date in the brief and we\'ll confirm scheduling before you pay.' },
      { q: 'Can I see the outfit before it\'s delivered?', a: 'Yes. We can send a preview for your approval, or deliver as a complete surprise.' },
    ],
    finalCta: {
      title: 'Give a gift he\'ll actually wear.',
      body: 'A complete styled outfit, beautifully presented. Tell us who it\'s for and we\'ll handle the rest.',
      button: 'Plan a Gift',
    },
  },

  {
    slug: 'traditional-wear-consultation',
    number: '06',
    category: 'Cultural',
    name: 'Traditional Wear Consultation',
    tagline: 'Agbada, kaftan, senator, and ceremonial wear — styled correctly for the occasion, culture, and your build.',
    description:
      'Agbada, kaftan, senator, and ceremonial wear — styled correctly for the occasion, the culture, and your build. We coordinate fabric, accessories, and tailoring.',
    image: '/services/traditional-wear-consultation.jpg',
    imageMobile: '/services/traditional-wear-consultation-mobile.jpg',
    imageAlt: 'A gentleman in a fully tailored three-piece Asooke agbada with matching fila cap and beaded accessories',
    startingPrice: 120000,
    priceLabel: 'From ₦120,000',
    priceUnit: 'Per occasion',
    priceNote: 'Per occasion · fabric & tailoring costs separate',
    featured: true,
    comingSoon: true,
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
      body: 'Whether it\'s a wedding, a chieftaincy, or a naming ceremony — join the waitlist and be first in line when bookings open.',
      button: 'Join the Waitlist',
    },
  },

  {
    slug: 'amendments-alterations',
    number: '07',
    category: 'Tailoring',
    name: 'Amendments & Alterations',
    tagline: 'Tailoring fixes and adjustments for any garment — hems, slimming, sleeves, repairs, and more.',
    description:
      'Tailoring fixes and adjustments for any garment — not just pieces bought from Wardrobecare. Hems, slimming, sleeve shortening, repairs, and more, with pick-up and drop-off included.',
    image: '/services/amendments-alterations.jpg',
    imageAlt: 'A tailor at work adjusting the sleeve of a men\'s garment',
    startingPrice: 5000,
    priceLabel: 'From ₦5,000',
    priceUnit: 'Per alteration',
    priceNote: '+ ₦20,000 service & handling fee per order',
    featured: false,
    whoFor: [
      'Something you own no longer fits quite right',
      'A new piece needs a small adjustment before it\'s wearable',
      'You want a quick repair, not a full re-tailor',
      'The item didn\'t come from Wardrobecare — that\'s fine, we still take it',
    ],
    whatsIncluded: [
      { step: '01', title: 'Tell Us What\'s Needed', body: 'Garment type and the alteration(s) required, photos optional.' },
      { step: '02', title: 'Pick-up', body: 'We collect the item(s) at a time that works for you.' },
      { step: '03', title: 'Drop-off', body: 'Altered items returned to you, ready to wear.' },
    ],
    pricingTable: {
      title: 'Pricing',
      subtitle: 'Per alteration — mix and match across multiple garments in one order.',
      rows: [
        { label: 'Trouser hem (shorten/lengthen)', amount: '₦5,000' },
        { label: 'Waist adjustment (trouser)', amount: '₦7,000' },
        { label: 'Sleeve shortening — shirt', amount: '₦5,000' },
        { label: 'Sleeve shortening — blazer/jacket', amount: '₦10,000' },
        { label: 'Take in / let out sides — blazer/jacket', amount: '₦15,000' },
        { label: 'Take in / let out sides — shirt', amount: '₦6,000' },
        { label: 'Take in / let out sides — t-shirt', amount: '₦5,000' },
        { label: 'Take in / let out sides — jean/pant', amount: '₦6,000' },
        { label: 'Tear / rib / gash repair', amount: '₦5,000' },
        { label: 'Button replacement', amount: '₦5,000' },
        { label: 'Zipper replacement', amount: '₦5,000' },
      ],
      feeBanner: {
        title: 'Service & Handling Fee',
        body: 'Mandatory on every order — covers pick-up/drop-off logistics, supervision, and expertise, regardless of item count.',
        amount: '₦20,000',
      },
      notes: [
        {
          lead: 'Need something not listed here?',
          body: 'Contact us for a custom quote — if the job can be done, we\'ll price it for you.',
        },
        {
          lead: 'Outside our standard pick-up/drop-off area?',
          body: 'Further locations are quoted case by case, confirmed before you book.',
        },
      ],
    },
    faqs: [
      { q: 'What does this service cover?', a: 'Tailoring fixes and adjustments for any garment — hems, waist adjustments, slimming, sleeve shortening, repairs, and button or zipper replacement. It doesn\'t have to be something you bought from us.' },
      { q: 'How is it priced?', a: 'Per alteration — each fix has its own price, and you can combine several on one order. On top of that, a Service & Handling fee applies to every order, covering pick-up, drop-off, supervision, and expertise.' },
      { q: 'Is the Service & Handling fee optional?', a: 'No — it\'s mandatory on every Amendments & Alterations order, regardless of how many items you bring, since pick-up, drop-off, and oversight happen either way.' },
      { q: 'How does pick-up and drop-off work?', a: 'We collect the item(s) from you, complete the work, and return them once finished — just tell us a pick-up time and address when you book.' },
      { q: 'What if my alteration isn\'t on the price list?', a: 'Contact us for a custom quote. If the job can be done, we\'ll price it for you after seeing the garment and the work involved.' },
      { q: 'What if I\'m outside your usual pick-up area?', a: 'That\'s handled case by case — let us know your location and we\'ll confirm whether it\'s covered and what it costs before you book.' },
    ],
    finalCta: {
      title: 'Send us a photo — we\'ll quote it.',
      body: 'Tell us the garment and the fix it needs. We\'ll quote the alteration, arrange pick-up, and return it ready to wear.',
      button: 'Book an Alteration',
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
    label: 'Tailoring',
    description: 'Fixes, adjustments, and repairs.',
    services: SERVICES.filter((s) => s.category === 'Tailoring'),
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

/** Services that are open for bookings and enquiries right now. */
export function getBookableServices(): Service[] {
  return SERVICES.filter((s) => !s.comingSoon)
}

/**
 * Related services for the [slug] page — same category first, bookable
 * services preferred over coming-soon ones.
 */
export function getRelatedServices(currentSlug: string, limit = 3): Service[] {
  const current = getServiceBySlug(currentSlug)
  const pool = SERVICES.filter((s) => s.slug !== currentSlug)
  const sameCategory = current ? pool.filter((s) => s.category === current.category) : []
  const rest = pool.filter((s) => !sameCategory.includes(s))
  const bookableFirst = (list: Service[]) => [
    ...list.filter((s) => !s.comingSoon),
    ...list.filter((s) => s.comingSoon),
  ]
  return [...bookableFirst(sameCategory), ...bookableFirst(rest)].slice(0, limit)
}
