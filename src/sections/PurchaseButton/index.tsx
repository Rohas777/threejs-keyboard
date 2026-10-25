'use client';

import { Bounded } from '@/components/layout/Bounded';
import { FadeIn } from '@/components/ui/FadeIn';
import { useCheckout } from '@/hooks/useCheckout';
import { fontAxesAt, RESTING_FONT_AXES } from '@/lib/fontAxes';
import { gsap, useGSAP } from '@/lib/gsap';
import clsx from 'clsx';
import { useRef } from 'react';
import { LuChevronRight, LuLoader } from 'react-icons/lu';

const PurchaseButton = () => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);
    const { checkout, isPending } = useCheckout();

    useGSAP(() => {
        const button = buttonRef.current;
        const text = textRef.current;
        if (!button || !text) return;

        const toWdth = gsap.quickTo(text, '--wdth', { duration: 0.3, ease: 'power2.inOut' });
        const toWght = gsap.quickTo(text, '--wght', { duration: 0.3, ease: 'power2.inOut' });

        const handleMouseMove = (event: MouseEvent) => {
            const rect = button.getBoundingClientRect();
            const { wdth, wght } = fontAxesAt((event.clientX - rect.left) / rect.width);
            toWdth(wdth);
            toWght(wght);
        };

        const handleMouseLeave = () => {
            toWdth(RESTING_FONT_AXES.wdth);
            toWght(RESTING_FONT_AXES.wght);
        };

        button.addEventListener('mousemove', handleMouseMove);
        button.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            button.removeEventListener('mousemove', handleMouseMove);
            button.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <Bounded>
            <FadeIn className="relative mx-auto max-w-7xl px-4 text-center" targetChildren>
                <p className="mb-7 text-xl font-medium text-gray-700 md:text-2xl">Experience Peak Performance</p>
                <h2
                    id="buy-button"
                    className="font-bold-slanted mb-8 scroll-mt-24 text-5xl text-gray-900 uppercase md:text-7xl lg:text-8xl"
                >
                    Order Yours Now
                </h2>
                <button
                    ref={buttonRef}
                    onClick={checkout}
                    disabled={isPending}
                    className={clsx(
                        'group relative w-full overflow-hidden rounded-full border-8 border-gray-900 bg-linear-to-r/oklch from-sky-300 to-sky-600 px-6 py-6 ease-out focus:ring-[24px] focus:ring-sky-500/50 focus:outline-none motion-safe:transition-all motion-safe:duration-300 md:border-[12px] md:px-20 md:py-16',
                        'hover:scale-105 hover:shadow-2xl hover:shadow-sky-500/40',
                        'active:scale-95',
                        isPending ? 'scale-95 cursor-not-allowed opacity-80' : 'cursor-pointer',
                    )}
                >
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent ease-out group-hover:translate-x-full motion-safe:transition-transform motion-safe:duration-1000" />
                    <div className="relative z-10 flex items-center justify-center gap-6 md:gap-8">
                        <span
                            ref={textRef}
                            style={{ '--wdth': RESTING_FONT_AXES.wdth, '--wght': RESTING_FONT_AXES.wght }}
                            className="font-black-slanted text-4xl tracking-wide text-gray-900 uppercase group-hover:-translate-y-1 motion-safe:transition-transform motion-safe:duration-300 md:text-7xl lg:text-9xl"
                        >
                            {isPending ? (
                                <span className="flex items-center gap-4 md:gap-6">
                                    <LuLoader className="size-12 animate-spin text-gray-900 md:size-16" />
                                    Loading...
                                </span>
                            ) : (
                                'Buy Vapor75'
                            )}
                        </span>
                        {!isPending && (
                            <div className="hidden group-hover:translate-x-2 group-hover:scale-125 motion-safe:transition-all motion-safe:duration-300 md:block">
                                <LuChevronRight className="size-12 text-gray-900 md:size-16" />
                            </div>
                        )}
                    </div>
                </button>
                <div className="mt-12 space-y-3 text-base text-gray-600 md:text-lg">
                    <p>
                        <strong>Free worldwide shipping • 30-day guarantee • 2-year warranty</strong>
                    </p>
                    <p>Join 10,000+ satisfied customers worldwide</p>
                </div>
            </FadeIn>
        </Bounded>
    );
};

export default PurchaseButton;
