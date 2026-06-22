import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "primereact/button";

// ─── ErrorBoundary ───────────────────────────────────────
// Catches JavaScript errors thrown during render anywhere in its
// child tree and shows a fallback UI instead of unmounting the
// whole app to a blank screen.
//
// NOTE: this only catches errors during rendering, in lifecycle
// methods, and in constructors of the tree below it. It does NOT
// catch errors in event handlers, async code (setTimeout, promises),
// or server-side rendering — those need their own try/catch.
//
// Must be a class component — React has no hook equivalent of
// componentDidCatch / getDerivedStateFromError yet.

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // TODO: send to your error tracking service (Sentry, etc.)
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.assign("/");
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-6">
          <div className="text-center max-w-md">
            <p className="text-6xl font-bold text-red-500 mb-2">!</p>
            <h1 className="text-xl font-bold text-foreground mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              An unexpected error occurred. Try reloading the page — if the
              problem keeps happening, contact support.
            </p>
            <Button label="Reload" icon="pi pi-refresh" onClick={this.handleReload} />
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}