import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Bottoms — Wardrobecare',
  description: 'Shop trousers, chinos, jeans, joggers and shorts from Wardrobecare.',
}

export default function BottomsPage() {
  redirect('/shop?category=bottoms')
}
