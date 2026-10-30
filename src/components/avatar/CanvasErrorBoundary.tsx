'use client'

/** Error boundary around the 3D canvas — a WebGL crash never takes the page down. */

import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

export interface CanvasErrorBoundaryProps {
  children: ReactNode
}

interface CanvasErrorBoundaryState {
  hasError: boolean
}

export class CanvasErrorBoundary extends Component<CanvasErrorBoundaryProps, CanvasErrorBoundaryState> {
  override state: CanvasErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): CanvasErrorBoundaryState {
    return { hasError: true }
  }

  override componentDidCatch(_error: Error, _errorInfo: ErrorInfo): void {
    // Swallowed intentionally: the fallback UI communicates the failure.
  }

  private readonly handleRetry = (): void => {
    this.setState({ hasError: false })
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="font-heading text-base font-semibold text-foreground">The 3D view hit a snag</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Something went wrong while rendering the body map. The region list remains fully usable.
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="rounded-full border border-copper/40 px-4 py-1.5 text-sm font-medium text-copper transition-colors duration-150 hover:bg-copper/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
          >
            Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
