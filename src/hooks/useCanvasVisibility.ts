import { useEffect, useRef, useState } from 'react';

/** NOTE Margin around the viewport in which a canvas is mounted and rendered ahead of scrolling into view. */
const NEAR_VIEWPORT_MARGIN = '25% 0px';

/**
 * Tracks whether an element is near the viewport to drive a WebGL canvas lifecycle.
 *
 * @returns `ref` for the observed element; `isNear` — element is within the viewport margin now
 * (use for `frameloop`); `wasNear` — element has been near at least once (use to mount the canvas lazily
 * and keep its WebGL context afterwards).
 */
export function useCanvasVisibility<T extends Element>() {
    const ref = useRef<T>(null);
    const [isNear, setIsNear] = useState(false);
    const [wasNear, setWasNear] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsNear(entry.isIntersecting);
                if (entry.isIntersecting) setWasNear(true);
            },
            { rootMargin: NEAR_VIEWPORT_MARGIN },
        );
        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    return { ref, isNear, wasNear };
}
