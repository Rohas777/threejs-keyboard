'use client';

import { Bounded } from '@/components/Bounded';
import { FadeIn } from '@/components/FadeIn';
import { useGSAP } from '@gsap/react';
import clsx from 'clsx';
import gsap from 'gsap';
import React, { useRef, useState } from 'react';
import { LuChevronRight, LuLoader } from 'react-icons/lu';

gsap.registerPlugin(useGSAP);

const PurchaseButton = () => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);
    const [isPressed, setIsPressed] = useState(false);

    const handlePurchaseClick = async () => {
        setIsPressed(true);
        // TODO CHECKOUT LOGIC
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setIsPressed(false);
    };

    useGSAP(() => {
        if (!buttonRef.current || !textRef.current) return;

        const handleMouseMove = (event: MouseEvent) => {
            if (!buttonRef.current || !textRef.current) return;
            const buttonRect = buttonRef.current.getBoundingClientRect();
            const mouseX = event.clientX - buttonRect.left;
            const buttonWidth = buttonRect.width;

            const normolizedX = Math.max(0, Math.min(1, mouseX / buttonWidth));

            const newWdth = 120 - normolizedX * 70; // 120 = thiner, 50 = wider
            const newWght = 700 + normolizedX * 300; // 700 = lighter, 1000 = bolder

            gsap.to(textRef.current, {
                '--wdth': newWdth,
                '--wght': newWght,
                duration: 0.3,
                ease: 'power2.inOut',
            });
        };

        const handleMouseLeave = (event: MouseEvent) => {
            if (!textRef.current) return;

            gsap.to(textRef.current, {
                '--wdth': 85,
                '--wght': 850,
                duration: 0.5,
                ease: 'power2.inOut',
            });
        };

        buttonRef.current?.addEventListener('mousemove', handleMouseMove);
        buttonRef.current?.addEventListener('mouseleave', handleMouseLeave);
        gsap.set(textRef.current, {
            '--wdth': 85,
            '--wght': 850,
        });

        return () => {
            if (buttonRef.current) {
                buttonRef.current.removeEventListener('mousemove', handleMouseMove);
                buttonRef.current?.removeEventListener('mouseleave', handleMouseLeave);
            }
        };
    }, []);

    return (
        <Bounded>
            <FadeIn className="relative mx-auto max-w-7xl px-4 text-center" targetChildren>
                <p className="mb-7 text-xl font-medium text-gray-700 md:text-2xl">Experience Peak Performance</p>
                <h2
                    id="buy-button"
                    className="font-bold-slanted mb-8 scroll-pt-6 text-5xl text-gray-900 uppercase md:text-7xl lg:text-8xl"
                >
                    Order Yours Now
                </h2>
                <button
                    ref={buttonRef}
                    onClick={handlePurchaseClick}
                    disabled={isPressed}
                    className={clsx(
                        'group relative w-full overflow-hidden rounded-full border-8 border-gray-900 bg-linear-to-r/oklch from-sky-300 to-sky-600 px-6 py-6 ease-out focus:ring-[24px] focus:ring-sky-500/50 focus:outline-none motion-safe:transition-all motion-safe:duration-300 md:border-[12px] md:px-20 md:py-16',
                        'hover:scale-105 hover:shadow-2xl hover:shadow-sky-500/40',
                        'active:scale-95',
                        isPressed ? 'scale-95 cursor-not-allowed opacity-80' : 'cursor-pointer',
                    )}
                >
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent ease-out group-hover:translate-x-full motion-safe:transition-transform motion-safe:duration-1000" />
                    <div className="relative z-10 flex items-center justify-center gap-6 md:gap-8">
                        <span
                            ref={textRef}
                            style={{ '--wdth': 85, '--wght': 850 } as React.CSSProperties}
                            className="font-black-slanted to-gray-900 text-4xl tracking-wide uppercase group-hover:-translate-y-1 motion-safe:transition-transform motion-safe:duration-300 md:text-7xl lg:text-9xl"
                        >
                            {isPressed ? (
                                <span className="flex items-center gap-4 md:gap-6">
                                    <LuLoader className="size-12 animate-spin text-gray-900 md:size-16" />
                                    Loading...
                                </span>
                            ) : (
                                'Buy Vapor75'
                            )}
                        </span>
                        {!isPressed && (
                            <div className="hidden group-hover:translate-x-2 group-hover:scale-125 motion-safe:transition-all motion-safe:duration-300 md:block">
                                <LuChevronRight className="size-12 to-gray-900 md:size-16" />
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
