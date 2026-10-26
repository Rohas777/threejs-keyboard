import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

/** Media query for users without a reduced-motion preference. */
export const MOTION_OK = '(prefers-reduced-motion: no-preference)';

/** Media query for users who prefer reduced motion. */
export const MOTION_REDUCED = '(prefers-reduced-motion: reduce)';

/**
 * ScrollTrigger callback for the first position calculation: an animation whose trigger is already passed
 * jumps to its final state instead of playing or scrubbing from the start (page opened mid-scroll).
 *
 * @example
 * gsap.to(target, { opacity: 1, scrollTrigger: { trigger, ...settleOnFirstRefresh() } });
 */
export function settleOnFirstRefresh(): Pick<ScrollTrigger.Vars, 'onRefresh'> {
    let isSettled = false;

    return {
        onRefresh: (trigger) => {
            if (isSettled) return;
            isSettled = true;
            if (trigger.progress === 0) return;

            const scrub = trigger.getTween();
            if (scrub) scrub.progress(1);
            else trigger.animation?.progress(1);
        },
    };
}

export { gsap, useGSAP, ScrollTrigger, SplitText };
