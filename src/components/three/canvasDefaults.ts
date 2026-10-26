import type { CanvasProps } from '@react-three/fiber';

/**
 * Shared settings of every page canvas.
 * NOTE `resize.scroll` is off: R3F re-measures on scroll by default, and a fractional element height then
 * flips the drawing buffer between two sizes while scrolling, re-allocating it each time. Pointer events
 * use `offsetX/offsetY`, so the canvas position on the page is not needed.
 */
export const CANVAS_DEFAULTS = {
    dpr: [1, 1.5],
    resize: { scroll: false },
} as const satisfies Partial<CanvasProps>;
