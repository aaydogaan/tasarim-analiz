import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  props: Props;
  state: State = {
    hasError: false
  };

  constructor(props: Props) {
    super(props);
    this.props = props;
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-3xl p-8 text-center shadow-xl">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Bir şeyler ters gitti</h1>
            <p className="text-[var(--text-secondary)] text-sm mb-8 leading-relaxed">
              Beklenmeyen bir hata oluştu. Sayfayı yenileyerek tekrar deneyebilirsiniz. Hata devam ederse lütfen daha sonra tekrar deneyin.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-[var(--text-primary)] text-[var(--bg-primary)] hover:scale-[1.02] active:scale-95 transition-all font-bold py-3.5 rounded-xl flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Sayfayı Yenile
            </button>
          </div>
        </div>
      );
    }

    return (this.props as any).children;
  }
}
