'use client'

/** First-visit acknowledgement dialog — stored once in versioned localStorage. */

import { useEffect, useState } from 'react'
import { ShieldAlert } from 'lucide-react'
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
import { readStoredValue, writeStoredValue } from '@/lib/storage/storage'
import { SITE } from '@/config/site'
import { useHydrated } from '@/hooks/useHydrated'

export function DisclaimerGate() {
  const hydrated = useHydrated()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!hydrated) return
    const acknowledged = readStoredValue<boolean>(STORAGE_KEYS.disclaimerAck, false)
    if (!acknowledged) setOpen(true)
  }, [hydrated])

  const handleAcknowledge = (): void => {
    writeStoredValue(STORAGE_KEYS.disclaimerAck, true)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="border-white/10 bg-surface sm:max-w-md">
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
          <Button onClick={handleAcknowledge} className="bg-brand-blue text-white hover:bg-brand-blue/85">
            I understand — continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
