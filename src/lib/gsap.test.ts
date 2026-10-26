import { describe, expect, it, vi } from 'vitest';
import { type ScrollTrigger, settleOnFirstRefresh } from './gsap';

function fakeTrigger(progress: number, hasScrub: boolean) {
    const scrub = { progress: vi.fn() };
    const animation = { progress: vi.fn() };
    const trigger = {
        progress,
        animation,
        getTween: () => (hasScrub ? scrub : undefined),
    } as unknown as ScrollTrigger;
    return { trigger, scrub, animation };
}

describe('settleOnFirstRefresh', () => {
    it('leaves animations of triggers that are not reached yet untouched', () => {
        const { onRefresh } = settleOnFirstRefresh();
        const { trigger, scrub, animation } = fakeTrigger(0, true);

        onRefresh?.(trigger);

        expect(scrub.progress).not.toHaveBeenCalled();
        expect(animation.progress).not.toHaveBeenCalled();
    });

    it('finishes the scrub of a passed scrubbed trigger', () => {
        const { onRefresh } = settleOnFirstRefresh();
        const { trigger, scrub, animation } = fakeTrigger(0.4, true);

        onRefresh?.(trigger);

        expect(scrub.progress).toHaveBeenCalledWith(1);
        expect(animation.progress).not.toHaveBeenCalled();
    });

    it('completes the animation of a passed toggle trigger', () => {
        const { onRefresh } = settleOnFirstRefresh();
        const { trigger, animation } = fakeTrigger(1, false);

        onRefresh?.(trigger);

        expect(animation.progress).toHaveBeenCalledWith(1);
    });

    it('acts only on the first refresh', () => {
        const { onRefresh } = settleOnFirstRefresh();
        const first = fakeTrigger(0, false);
        const second = fakeTrigger(1, false);

        onRefresh?.(first.trigger);
        onRefresh?.(second.trigger);

        expect(second.animation.progress).not.toHaveBeenCalled();
    });
});
