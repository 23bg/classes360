'use client'
import { clientLogger } from '@/lib/clientLogger'
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  clientLogger.error('global_error', { message: error.message, stack: error.stack })

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-semibold text-destructive">Something went wrong</h1>
      <p className="text-muted-foreground">{error.message}</p>
      <button
        onClick={() => reset()}
        className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
      >
        Try Again
      </button>
    </div>
  )
}

