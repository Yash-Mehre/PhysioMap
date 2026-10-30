import { ShieldAlert } from 'lucide-react'
import { SITE } from '@/config/site'

/** Slim permanent disclaimer strip (shown at the top of the explorer and pain contexts). */
export function DisclaimerBanner() {
  return (
    <div
      role="note"
      className="flex items-start gap-2 rounded-lg border border-mode-pain/25 bg-mode-pain/8 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground sm:text-xs"
    >
      <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mode-pain" aria-hidden="true" />
      <span>
        <span className="font-semibold text-foreground/90">Guidance, not diagnosis.</span>{' '}
        {SITE.disclaimerShort}
      </span>
    </div>
  )
}
