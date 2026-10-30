'use client'

/**
 * First-visit acknowledgement dialog — stored once in versioned localStorage.
 * Open state derives from a `useSyncExternalStore` store, so the server and
 * the first client render agree (dialog closed) and no hydration mismatch is
 * possible; the dialog opens only after mount if not yet acknowledged.
 *
 * The open is additionally delayed one tick past hydration: modal Radix
 * dialogs mark all body children `aria-hidden` the moment they open, and
 * opening during Next.js streaming hydration of the page segment would log
 * a hydration warning. The short delay lets hydration settle first.
 */

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { STORAGE_KEYS } from '@/config/storageKeys'
import { createLocalStorageStore, useLocalStorageStoreValue } from '@/lib/storage/localStorageStore'
import { useHydrated } from '@/hooks/useHydrated'
import { SITE } from '@/config/site'
import { ShieldAlert } from 'lucide-react'

const disclaimerAckStore = createLocalStorageStore<boolean>(STORAGE_KEYS.disclaimerAck, false)

/** Delay (ms) after hydration before the modal opens, so streaming
 * hydration of the page segment settles before the dialog mutates the DOM. */
const OPEN_DELAY_MS = 300

export function DisclaimerGate() {
  const hydrated = useHydrated()
  const [acknowledged, setAcknowledged] = useLocalStorageStoreValue(disclaimerAckStore)
  const [settled, setSettled] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setSettled(true), OPEN_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [])

  const open = hydrated && settled && !acknowledged

  return (
    <Dialog open={open} onOpenChange={(next) => !next && setAcknowledged(true)}>
      <DialogContent
        className="border-white/10 bg-surface sm:max-w-md"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading">
            <ShieldAlert className="h-5 w-5 text-mode-pain" aria-hidden="true" />
            Before you explore
          </DialogTitle>
          <DialogDescription className="pt-1 text-sm leading-relaxed text-muted-foreground">
            {SITE.disclaimerLong}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => setAcknowledged(true)} className="bg-brand-blue text-white hover:bg-brand-blue/85">
            I understand — continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
