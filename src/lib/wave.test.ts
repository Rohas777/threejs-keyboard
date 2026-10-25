import { describe, expect, it } from 'vitest';
import { waveStartTimes } from './wave';

describe('waveStartTimes', () => {
    it('spreads start times linearly between the leftmost and rightmost element', () => {
        expect(waveStartTimes([0, 5, 10], 0.5, 2)).toEqual([0.5, 1.5, 2.5]);
    });

    it('keeps the input order regardless of positions', () => {
        expect(waveStartTimes([10, -10, 0], 0, 1)).toEqual([1, 0, 0.5]);
    });

    it('gives equal positions equal start times', () => {
        const [a, b, c] = waveStartTimes([0.1, 0.3, 0.1], 0, 2);
        expect(a).toBe(c);
        expect(b).toBe(2);
    });

    it('starts every element at the offset when all positions match', () => {
        expect(waveStartTimes([3, 3, 3], 0.5, 2)).toEqual([0.5, 0.5, 0.5]);
    });

    it('returns an empty list for no elements', () => {
        expect(waveStartTimes([], 0.5, 2)).toEqual([]);
    });
});
