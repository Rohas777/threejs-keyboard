/**
 * Start times of a left-to-right wave: each element starts proportionally to its position on the X axis.
 *
 * @param positions - X coordinate of every element, in any order.
 * @param offset - Start time of the leftmost element.
 * @param spread - Time between the leftmost and the rightmost element.
 * @returns Start time for each element, index-aligned with `positions`; all equal to `offset` when every
 * position is the same.
 *
 * @example
 * waveStartTimes([0, 5, 10], 0.5, 2); // [0.5, 1.5, 2.5]
 *
 * @remarks O(n) time, O(n) memory.
 */
export function waveStartTimes(positions: readonly number[], offset: number, spread: number): number[] {
    if (positions.length === 0) return [];

    let min = Infinity;
    let max = -Infinity;
    for (const x of positions) {
        if (x < min) min = x;
        if (x > max) max = x;
    }

    const range = max - min;
    return positions.map((x) => (range === 0 ? offset : offset + ((x - min) / range) * spread));
}
