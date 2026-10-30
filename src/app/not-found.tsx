import Link from 'next/link'
import { ArrowLeft, Dumbbell } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-copper/30 bg-surface-raised">
        <Dumbbell className="h-6 w-6 text-copper" aria-hidden="true" />
      </div>
      <div className="space-y-2">
        <p className="eyebrow">Error 404</p>
        <h1 className="font-heading text-3xl font-extrabold text-foreground">This muscle isn’t on the map</h1>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">
          The page you’re looking for doesn’t exist — but every real body part is waiting in the explorer.
        </p>
      </div>
      <Button asChild className="bg-brand-blue text-white hover:bg-brand-blue/85">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Back to safety
        </Link>
      </Button>
    </div>
  )
}
