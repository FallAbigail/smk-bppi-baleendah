export interface NavLink {
  label: string
  href: string
}

export interface StatItem {
  value: string
  label: string
  suffix?: string
}

export interface ProgramItem {
  title: string
  description: string
  icon: string
  color: string
}

export interface TestimonialItem {
  name: string
  role: string
  quote: string
  avatar: string
}

export interface GalleryItem {
  id: number
  src: string
  alt: string
  category: string
}

export interface NewsItem {
  id: number
  title: string
  excerpt: string
  date: string
  category: string
  image: string
}
