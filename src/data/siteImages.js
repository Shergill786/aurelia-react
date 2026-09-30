/**
 * siteImages.js — editorial images for the home page.
 * Kept in one place so the Loading screen can preload exactly what Home shows.
 */

export const HERO_SLIDES = [
  { img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&q=80&auto=format&fit=crop', alt: 'Clothing rails in the Aurelia store', caption: 'New Arrivals — Apparel Edit' },
  { img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=900&q=80&auto=format&fit=crop', alt: 'Black leather jacket', caption: 'The Obsidian Leather Jacket' },
  { img: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=900&q=80&auto=format&fit=crop', alt: 'Woman in a puffer coat', caption: 'Cold-Weather Coats, Covered' },
];

export const CATEGORY_CARDS = [
  { section: 'Men', img: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=600&q=80&auto=format&fit=crop', alt: 'Man in a blue suit' },
  { section: 'Women', img: 'https://images.unsplash.com/photo-1759992878336-a5dd342ea245?w=600&q=80&auto=format&fit=crop', alt: 'Woman in a floral wrap dress' },
  { section: 'Kids', img: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=600&q=80&auto=format&fit=crop', alt: 'Child in casual clothes' },
];

/** Everything the Loading screen warms up before the store opens. */
export const PRELOAD_IMAGES = [...HERO_SLIDES, ...CATEGORY_CARDS].map((item) => item.img);
