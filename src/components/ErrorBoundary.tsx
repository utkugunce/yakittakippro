import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/Button';

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center text-gray-800 dark:text-gray-200">
                    <h2 className="text-2xl font-bold mb-4">Bir şeyler yanlış gitti</h2>
                    <p className="mb-6 text-gray-600 dark:text-gray-400 max-w-md">
                        Uygulamada beklenmedik bir hata oluştu. Lütfen sayfayı yenilemeyi deneyin.
                    </p>
                    <Button
                        onClick={() => window.location.reload()}
                        variant="default"
                    >
                        Sayfayı Yenile
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
