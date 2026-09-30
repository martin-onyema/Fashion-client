/**
 * Wardrobecare FAQ — content-driven from the editorial FAQ structure.
 *
 * 18 numbered categories + the WhatsApp quick-command table. Rendered on
 * /faq with FAQPage JSON-LD for search engines.
 */

export type FaqItem = {
  q: string
  /** Answer body — may contain \n line breaks for simple lists. */
  a: string
}

export type FaqCategory = {
  /** Anchor id used in the table of contents and section headings. */
  id: string
  /** Display number, e.g. "01". */
  num: string
  title: string
  /** Optional status tag, e.g. "Coming Soon". */
  tag?: string
  items: FaqItem[]
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: 'about',
    num: '01',
    title: 'About Wardrobecare',
    items: [
      {
        q: 'What is Wardrobecare?',
        a: "A Lagos-based menswear and personal styling business built around one idea: dressing well shouldn't require guesswork. We pair a curated retail edit with real styling expertise — from full wardrobe consultations to shopping done entirely on your behalf.",
      },
      {
        q: 'What makes Wardrobecare different?',
        a: "Most clothing shops stop at checkout — we start there. Every service is built around answering a real question first: what actually fits you, what works together, what's worth buying. The clothes follow from that, not the other way round.",
      },
      {
        q: 'Who is Wardrobecare for?',
        a: "Any man who wants to look put-together without spending hours figuring out how — whether that's for the office, church, a wedding, or an ordinary Tuesday.",
      },
      {
        q: 'Do I need to visit a store in person?',
        a: 'Not necessarily. A large part of how we work happens over WhatsApp and video call, so you can be styled and shop without ever walking into a physical space.',
      },
    ],
  },
  {
    id: 'products',
    num: '02',
    title: 'Products',
    items: [
      {
        q: 'What do you sell?',
        a: 'Menswear essentials and accessories — shirts, trousers, jackets, blazers, suits, footwear, belts, ties, wallets, fragrance and grooming essentials, and more.',
      },
      {
        q: 'Can I buy a complete outfit, not just single pieces?',
        a: 'Either way works. Buy individual items on your own, or hand the brief to Personal Shopping and let us put a full look together for you.',
      },
      {
        q: 'Can you help me decide what to buy?',
        a: "That's most of what we do. Tell us the occasion, your size, and your budget, and we'll narrow the options down instead of leaving you to guess.",
      },
      {
        q: 'Do you have different price levels?',
        a: 'Yes — our range spans Essential, Classic, and Signature tiers, depending on stock.',
      },
      {
        q: 'Is everything shown always in stock?',
        a: "Stock moves quickly, so please confirm an item's availability, colour, and size with us before paying.",
      },
    ],
  },
  {
    id: 'wardrobe-style',
    num: '03',
    title: 'Wardrobe & Style Consultation',
    items: [
      {
        q: 'What happens in a Wardrobe & Style Consultation?',
        a: "One session, two things at once: finding your personal style direction, and reviewing what's already in your closet — built around your lifestyle, body type, and the occasions you actually dress for.",
      },
      {
        q: 'Can this help me figure out my personal style?',
        a: "Yes — that's the core of it. We identify the colours, cuts, and combinations that genuinely work for you, so you're not relying on trial and error.",
      },
      {
        q: 'Will you go through my existing wardrobe?',
        a: "Yes. We sort what's working from what isn't, and flag the specific gaps worth filling next.",
      },
      {
        q: 'Can you help me dress for a specific event?',
        a: 'Yes — weddings, interviews, dinners, church, business meetings, whatever the occasion calls for.',
      },
    ],
  },
  {
    id: 'personal-shopping',
    num: '04',
    title: 'Personal Shopping',
    items: [
      {
        q: 'What is Personal Shopping?',
        a: "We shop on your behalf — sourcing pieces based on your brief, your size, your budget, and the occasion — so you don't have to. You choose how the fitting happens: delivered to you, or a stylist brings it in person.",
      },
      {
        q: "What's the difference between Delivered and In-Person Fitting?",
        a: 'Delivered means the sourced pieces ship to you and you try them on yourself. In-Person Fitting means a stylist brings the same curated selection to your home or office and guides the try-on directly — useful if you\'d rather have someone there to help decide.',
      },
      {
        q: 'How long does an In-Person Fitting last?',
        a: 'The fee covers up to 60 minutes on-site. If it runs longer, additional time is billed at ₦5,000 per 30 minutes.',
      },
      {
        q: "I genuinely don't know what to wear. Can you help?",
        a: "Yes. Give us the occasion and a sense of your taste, and we'll bring you a shortlist instead of leaving you to guess.",
      },
      {
        q: "I don't have time to shop. Can you do it for me?",
        a: "That's exactly the gap this service fills — you hand off the searching, we handle the rest.",
      },
      {
        q: 'Can you help me build out my wardrobe?',
        a: "Yes. We look for what's genuinely missing and recommend pieces that work with what you already own, rather than just adding more.",
      },
      {
        q: 'Does packaging cost extra for a large order?',
        a: "No — items are delivered in Wardrobecare's custom shopping bags at no extra cost, however large the order. The box-tier pricing you'll see on Outfit Gifting doesn't apply here.",
      },
      {
        q: 'How do I book an In-Person Fitting?',
        a: "By call, chat, or video call — reach out through WhatsApp, phone, or the Services page, and we'll lock in a time that works for you.",
      },
      {
        q: 'Can I reschedule an In-Person Fitting?',
        a: 'Yes — contact us 24 hours ahead or less. The more notice you can give, the easier it is for us to fit you in again.',
      },
    ],
  },
  {
    id: 'gifting',
    num: '05',
    title: 'Outfit Gifting',
    items: [
      {
        q: 'Can I buy an outfit as a gift for someone else?',
        a: 'Yes — we style a complete outfit, gift-wrap it, and deliver it, ready to give.',
      },
      {
        q: "What if I don't know their size?",
        a: "We'll walk you through practical ways to figure that out before anything's bought.",
      },
      {
        q: 'Can I include a personal message?',
        a: 'Yes — a note can be included with the delivery.',
      },
      {
        q: 'Does packaging cost extra?',
        a: "The styling fee includes packing and your first box, as long as it's small or medium. A large first box adds ₦10,000. If you're gifting more than one outfit, each additional box is priced by size — ₦10,000 small, ₦20,000 medium, ₦30,000 large.",
      },
      {
        q: 'Can I gift more than one outfit at once?',
        a: 'Yes — each additional outfit that needs its own box is priced as an additional box (see above). Delivery for larger multi-box orders is assessed separately rather than the standard per-location fee.',
      },
    ],
  },
  {
    id: 'amendments-alterations',
    num: '06',
    title: 'Amendments & Alterations',
    items: [
      {
        q: 'What does this service cover?',
        a: "Tailoring fixes and adjustments for any garment — hems, waist adjustments, slimming, sleeve shortening, repairs, and button or zipper replacement. It doesn't have to be something you bought from us.",
      },
      {
        q: 'How is it priced?',
        a: 'Per alteration — each fix has its own price, and you can combine several on one order. On top of that, a Service & Handling fee applies to every order, covering pick-up, drop-off, supervision, and expertise.',
      },
      {
        q: 'Is the Service & Handling fee optional?',
        a: "No — it's mandatory on every Amendments & Alterations order, regardless of how many items you bring, since pick-up, drop-off, and oversight happen either way.",
      },
      {
        q: 'How does pick-up and drop-off work?',
        a: 'We collect the item(s) from you, complete the work, and return them once finished — just tell us a pick-up time and address when you book.',
      },
      {
        q: "What if my alteration isn't on the price list?",
        a: "Contact us for a custom quote. If the job can be done, we'll price it for you after seeing the garment and the work involved.",
      },
      {
        q: "What if I'm outside your usual pick-up area?",
        a: "That's handled case by case — let us know your location and we'll confirm whether it's covered and what it costs before you book.",
      },
    ],
  },
  {
    id: 'premium-sourcing',
    num: '07',
    title: 'Premium Sourcing',
    tag: 'Coming Soon',
    items: [
      {
        q: 'What will this service cover?',
        a: 'Specific or hard-to-find pieces that go beyond a normal shopping brief — a particular brand, a rare item, that kind of request.',
      },
      {
        q: "Can you guarantee you'll find what I'm looking for?",
        a: "No — sourcing requests come with terms and conditions, and finding a specific or rare item isn't guaranteed. We'll always tell you upfront if something can't be sourced, rather than take payment for a search that may not succeed.",
      },
      {
        q: 'Can I book it now?',
        a: "Not yet — it's still in development. Join the notify list on the Services page and we'll let you know the moment it opens.",
      },
    ],
  },
  {
    id: 'traditional-wear',
    num: '08',
    title: 'Traditional Wear Consultation',
    tag: 'Coming Soon',
    items: [
      {
        q: 'What will this service cover?',
        a: 'Styling for agbada, kaftan, senator, and other ceremonial wear — matched properly to the occasion and your build.',
      },
      {
        q: 'Can I book it now?',
        a: 'Not yet — booking details will be posted here once the service goes live.',
      },
    ],
  },
  {
    id: 'sizing',
    num: '09',
    title: 'Sizing & Fit',
    items: [
      {
        q: "I'm not sure of my size. Can you help?",
        a: "Yes — share your measurements or relevant clothing details and we'll work out the closest available fit.",
      },
      {
        q: 'Can I send a photo instead?',
        a: 'It helps, especially for style recommendations — though we may still need actual measurements to get sizing exactly right.',
      },
      {
        q: 'Can you find my true fit, not just my usual size?',
        a: "Yes. Sizing isn't consistent across brands, so we go by how the actual garment fits rather than the label.",
      },
    ],
  },
  {
    id: 'ordering',
    num: '10',
    title: 'Ordering & Payment',
    items: [
      {
        q: 'How do I place an order?',
        a: 'Message us on WhatsApp or another Wardrobecare channel, choose what you want, and confirm size, colour, and delivery details.',
      },
      {
        q: 'Can I ask questions before I order?',
        a: 'Always — confirm whatever you need to before committing to anything.',
      },
      {
        q: 'How can I pay?',
        a: "Cash on Delivery is available within Lagos city, on a case-by-case basis — we confirm this with you directly before your order ships, since not every order qualifies. Where it's approved, you can pay by cash, bank transfer, mobile transfer, or online transfer. Orders outside Lagos, or where COD isn't approved, are paid in advance.",
      },
      {
        q: 'Can I reserve an item before paying?',
        a: "We don't hold items on a promise to pay — payment is what actually reserves it. Before you pay, check in with us to confirm the item is still available in your size and colour, since stock can move quickly.",
      },
    ],
  },
  {
    id: 'delivery',
    num: '11',
    title: 'Delivery',
    items: [
      {
        q: 'How long does delivery take?',
        a: '1 hour to 24 hours within Lagos, and 24 hours to around 3 working days outside Lagos, depending on the destination. Treat this as an estimate, not a guarantee.',
      },
      {
        q: 'What hours do you deliver in?',
        a: 'Between 8am and 6pm, with a call ahead to confirm roughly when to expect us.',
      },
      {
        q: 'Do you deliver outside Lagos?',
        a: 'Yes — just expect the longer end of the timeline. Confirm coverage and cost for your area before ordering.',
      },
      {
        q: 'Who needs to be around to receive it?',
        a: "You, or someone 18 or older representing you. If no one's available, a re-delivery fee may apply.",
      },
      {
        q: 'Does this apply to services too, like Personal Shopping or Outfit Gifting?',
        a: "Once your brief is approved or your gift is ready, it ships the same way as any retail order. Wardrobe & Style Consultation doesn't involve delivery at all — that's scheduled directly by phone or video.",
      },
    ],
  },
  {
    id: 'returns',
    num: '12',
    title: 'Returns & Exchanges',
    items: [
      {
        q: 'Can I return something?',
        a: 'We offer exchanges only, not cash refunds. Wrong size, wrong item, or a defective item can be exchanged within 48 hours — a change of mind has a shorter, 24-hour window, and can be issued as wallet credit instead of an exchange.',
      },
      {
        q: 'Can I exchange for a different size?',
        a: "Yes, as long as it's unworn, unused, and still has its tags and packaging intact. One thing to note: if the replacement size is out of stock, we can't guarantee how quickly we can get it to you — and if the wrong size was due to measurements or information you gave us, we're not responsible for the delay in resolving it.",
      },
      {
        q: 'What if I received the wrong item?',
        a: 'Let us know right away. If the mistake is on our end, we cover the delivery cost of putting it right.',
      },
      {
        q: 'Can I exchange something just because I changed my mind?',
        a: 'Yes, but the window is shorter here — 24 hours from delivery, not 48. You can either exchange it for something else, or have the value credited to your Wardrobecare wallet for a future purchase. Either way, the delivery cost for a change-of-mind exchange is on you.',
      },
    ],
  },
  {
    id: 'occasion',
    num: '13',
    title: 'Occasion Styling',
    items: [
      {
        q: 'Can you dress me for a wedding?',
        a: 'Yes — styled around your role at the event, the dress code, and the venue.',
      },
      {
        q: 'What about work or business occasions?',
        a: 'Yes, from everyday office wear to a big presentation.',
      },
      {
        q: 'Can you help me pack for a trip?',
        a: 'Yes — we can plan a few coordinated outfits so your suitcase stays sane.',
      },
    ],
  },
  {
    id: 'wardrobe-building',
    num: '14',
    title: 'Wardrobe Building',
    items: [
      {
        q: 'I have a full closet but "nothing to wear." Can you help?',
        a: 'You\'re not alone — most "closet full, nothing to wear" situations come down to pieces that don\'t talk to each other. We sort out what\'s actually working, what isn\'t, and why.',
      },
      {
        q: 'Can you build me a capsule wardrobe?',
        a: 'Yes, either through a Wardrobe & Style Consultation or the Capsule Wardrobe Builder tool, both built on the same styling principles.',
      },
      {
        q: 'Do I need to replace everything I own?',
        a: "Rarely. It's usually more about using what you already have better, and adding a few smart pieces where it counts.",
      },
    ],
  },
  {
    id: 'corporate',
    num: '15',
    title: 'Corporate & Executive Clients',
    items: [
      {
        q: 'Do you work with executives and professionals?',
        a: 'Yes — this is exactly the kind of efficient, no-guesswork styling busy professionals tend to need.',
      },
      {
        q: 'Can you handle multiple outfits at once, not just one item?',
        a: 'Yes — we can build out several looks in a single session rather than one piece at a time.',
      },
    ],
  },
  {
    id: 'unsure',
    num: '16',
    title: 'Not Sure What You Want?',
    items: [
      {
        q: '"I just need something nice." What do you need from me?',
        a: "That's a completely fine place to start. Tell us:\n1. What the outfit is for\n2. Where you're headed\n3. Your general style preference\n4. Your rough size\n5. Your budget\n6. Any colours you love or avoid\nWe'll take it from there.",
      },
      {
        q: 'Can I just say "choose for me"?',
        a: 'Genuinely, yes — that\'s where Personal Shopping and Wardrobe & Style Consultation earn their keep. The more you tell us, the sharper our picks.',
      },
    ],
  },
  {
    id: 'why',
    num: '17',
    title: 'Why Use a Personal Shopper?',
    items: [
      {
        q: "Why shouldn't I just shop for myself?",
        a: 'You can. What you\'re paying for here is time saved and better decisions — someone who already knows what works, doing the legwork for you.',
      },
      {
        q: 'Will you try to sell me more than I need?',
        a: 'No. The goal is a wardrobe that actually works for you, not a bigger receipt.',
      },
    ],
  },
  {
    id: 'contact',
    num: '18',
    title: 'Contact & Customer Service',
    items: [
      {
        q: 'How do I reach Wardrobecare?',
        a: 'Call or WhatsApp: +234 802 613 3770 · Email: hello@wardrobecare.com.ng · Hours: Mon–Sat, 9am–6pm (Lagos time).',
      },
      {
        q: 'What should I include when I call?',
        a: "The service you need, if you're booking one (Personal Shopping, Amendments & Alterations, etc.)\nYour brief — what you're looking for, in your own words\nThe item or type of clothing you need\nYour size\nColour preference\nThe occasion\nYour budget\nDelivery location\nAny deadline you're working with",
      },
    ],
  },
]

export const WHATSAPP_COMMANDS: { cmd: string; desc: string }[] = [
  { cmd: '/price', desc: 'Product price enquiry' },
  { cmd: '/available', desc: 'Stock availability' },
  { cmd: '/size', desc: 'Size assistance' },
  { cmd: '/delivery', desc: 'Delivery information' },
  { cmd: '/payment', desc: 'Payment information' },
  { cmd: '/personalshopping', desc: 'Personal Shopping' },
  { cmd: '/styleconsultation', desc: 'Wardrobe & Style Consultation' },
  { cmd: '/occasion', desc: 'Occasion Styling' },
  { cmd: '/gift', desc: 'Outfit Gifting' },
  { cmd: '/alterations', desc: 'Amendments & Alterations' },
  { cmd: '/sourcing', desc: 'Premium Sourcing (Coming Soon)' },
  { cmd: '/traditionalwear', desc: 'Traditional Wear Consultation (Coming Soon)' },
  { cmd: '/exchange', desc: 'Exchange policy' },
  { cmd: '/order', desc: 'How to place an order' },
  { cmd: '/recommend', desc: 'Product recommendation' },
]

export const FAQ_PAGE_UPDATED = 'Last updated — September 2026'
