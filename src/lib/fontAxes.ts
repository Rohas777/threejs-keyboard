export type FontAxes = { wdth: number; wght: number };

/** Axes of the purchase button label at rest. */
export const RESTING_FONT_AXES: FontAxes = { wdth: 85, wght: 850 };

/**
 * Variable-font axes of the purchase button label for a pointer position across the button:
 * the label gets narrower and bolder from left to right.
 *
 * @param progress - Pointer position from the left edge as a fraction of the width; clamped to `[0, 1]`.
 * @returns `wdth` from 120 (left edge) to 50 (right edge) and `wght` from 700 to 1000.
 *
 * @example
 * fontAxesAt(0.5); // { wdth: 85, wght: 850 }
 */
export function fontAxesAt(progress: number): FontAxes {
    const clamped = Math.max(0, Math.min(1, progress));
    return { wdth: 120 - clamped * 70, wght: 700 + clamped * 300 };
}
