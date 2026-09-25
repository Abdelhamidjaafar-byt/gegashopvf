import { useParams, Link } from 'react-router'
import { ArrowLeft, Clock, Calendar, User, ShieldCheck, Tag } from 'lucide-react'
import { GUIDES } from '@/data/guides'
import { Button } from '@/components/ui/button'

export default function GuideDetailPage() {
  const { id } = useParams()
  const guide = GUIDES.find((g) => g.id === id || g.slug === id) || GUIDES[0]

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      
      {/* Back to Guides */}
      <Button asChild variant="ghost" size="sm" className="mb-6 gap-2 text-xs font-bold text-muted-foreground hover:text-foreground">
        <Link to="/guides">
          <ArrowLeft className="h-4 w-4" /> Back to Tech Guides
        </Link>
      </Button>

      {/* Article Header */}
      <header className="space-y-4">
        <span className="inline-block rounded-full bg-volt/10 border border-volt/30 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-volt">
          {guide.category}
        </span>
        
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground leading-tight">
          {guide.title}
        </h1>

        <p className="text-base md:text-lg text-muted-foreground font-medium leading-relaxed">
          {guide.subtitle}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-4 border-y border-border/80 py-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-bold text-foreground">
              <User className="h-4 w-4 text-volt" /> {guide.author}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-muted-foreground" /> {guide.date}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-muted-foreground" /> {guide.readTime}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-volt" /> Verified Hardware Guide
          </div>
        </div>
      </header>

      {/* Hero Image */}
      <div className="my-8 overflow-hidden rounded-2xl border border-border shadow-md">
        <img src={guide.image} alt={guide.title} className="w-full max-h-[450px] object-cover" />
      </div>

      {/* Article Content */}
      <article className="prose prose-neutral max-w-none dark:prose-invert space-y-6 text-foreground text-sm sm:text-base leading-relaxed">
        {guide.content.map((paragraph, index) => (
          <p key={index} className="text-foreground/90 font-normal">
            {paragraph}
          </p>
        ))}
      </article>

      {/* Article Footer & Tags */}
      <div className="mt-10 border-t border-border/80 pt-6">
        <div className="flex flex-wrap items-center gap-2">
          <Tag className="h-4 w-4 text-volt mr-1" />
          {guide.tags.map((tag, idx) => (
            <span key={idx} className="rounded-md bg-secondary px-2.5 py-1 text-xs font-semibold text-muted-foreground">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
