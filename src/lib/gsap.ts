import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

/** Media query for users without a reduced-motion preference. */
export const MOTION_OK = '(prefers-reduced-motion: no-preference)';

/** Media query for users who prefer reduced motion. */
export const MOTION_REDUCED = '(prefers-reduced-motion: reduce)';

export { gsap, useGSAP, ScrollTrigger, SplitText };
