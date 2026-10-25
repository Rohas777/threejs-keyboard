'use client';

import { Component, ReactNode } from 'react';

type CanvasErrorBoundaryProps = {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: unknown) => void;
};

type CanvasErrorBoundaryState = { hasError: boolean };

/** Keeps the page alive when a 3D scene fails (WebGL unavailable, asset failed to load). */
export class CanvasErrorBoundary extends Component<CanvasErrorBoundaryProps, CanvasErrorBoundaryState> {
    state: CanvasErrorBoundaryState = { hasError: false };

    static getDerivedStateFromError(): CanvasErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: unknown) {
        console.error('3D scene failed to render', error);
        this.props.onError?.(error);
    }

    render() {
        return this.state.hasError ? (this.props.fallback ?? null) : this.props.children;
    }
}
