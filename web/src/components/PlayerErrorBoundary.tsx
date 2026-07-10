"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  onRetry?: () => void;
};

type State = { hasError: boolean };

/** Evita que un fallo del reproductor tumbe toda la página. */
export class PlayerErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[PlayerErrorBoundary]", error, info.componentStack);
  }

  private retry = () => {
    this.setState({ hasError: false });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex aspect-video w-full min-h-[280px] flex-col items-center justify-center gap-3 rounded-xl border border-white/10 bg-black p-6 text-center">
          <p className="text-sm text-brand-muted">
            Ocurrió un error al cargar el reproductor.
          </p>
          <button
            type="button"
            onClick={this.retry}
            className="rounded-full bg-brand-red px-6 py-2 text-sm font-semibold text-white"
          >
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
