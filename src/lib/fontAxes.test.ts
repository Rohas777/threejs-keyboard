import { describe, expect, it } from 'vitest';
import { fontAxesAt, RESTING_FONT_AXES } from './fontAxes';

describe('fontAxesAt', () => {
    it('is wide and light at the left edge', () => {
        expect(fontAxesAt(0)).toEqual({ wdth: 120, wght: 700 });
    });

    it('is narrow and bold at the right edge', () => {
        expect(fontAxesAt(1)).toEqual({ wdth: 50, wght: 1000 });
    });

    it('matches the resting axes in the middle', () => {
        expect(fontAxesAt(0.5)).toEqual(RESTING_FONT_AXES);
    });

    it('clamps positions outside the button', () => {
        expect(fontAxesAt(-0.3)).toEqual(fontAxesAt(0));
        expect(fontAxesAt(1.7)).toEqual(fontAxesAt(1));
    });
});
