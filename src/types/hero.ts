export interface HeroSlide {
  id: string
  type: 'video' | 'image'
  url: string
  badge?: string
  titleA?: string
  titleB?: string
  sub?: string
  bubbleText?: string
  ctaText?: string
  ctaLink?: string
  active: boolean
  order: number
}
