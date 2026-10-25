'use client';

import { gsap, MOTION_OK, useGSAP } from '@/lib/gsap';
import clsx from 'clsx';
import { ReactNode, useRef } from 'react';

type FadeInProps = {
    children?: ReactNode;
    className?: string;
    /** Animates each direct child with a stagger instead of the container as a whole. */
    targetChildren?: boolean;
};

/** Fades content in from below when it scrolls into the middle of the viewport. */
export const FadeIn = ({ children, className, targetChildren = false }: FadeInProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const container = containerRef.current;
            if (!container) return;

            const target = targetChildren ? container.children : container;
            const mm = gsap.matchMedia();

            mm.add(MOTION_OK, () => {
                gsap.fromTo(
                    target,
                    { opacity: 0, y: 60 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        ease: 'power3.out',
                        stagger: 0.2,
                        scrollTrigger: { trigger: container, start: 'top 50%' },
                    },
                );
            });
        },
        { dependencies: [targetChildren], revertOnUpdate: true },
    );

    return (
        // NOTE Content starts hidden so the server-rendered HTML does not flash before the animation takes over.
        <div
            ref={containerRef}
            className={clsx(targetChildren ? 'motion-safe:*:opacity-0' : 'motion-safe:opacity-0', className)}
        >
            {children}
        </div>
    );
};
