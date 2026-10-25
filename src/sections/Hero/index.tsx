'use client';

import { Bounded } from '@/components/layout/Bounded';
import { CanvasErrorBoundary } from '@/components/three/CanvasErrorBoundary';
import { Loader } from '@/components/ui/Loader';
import { useCanvasVisibility } from '@/hooks/useCanvasVisibility';
import { useCheckout } from '@/hooks/useCheckout';
import { gsap, MOTION_OK, MOTION_REDUCED, SplitText, useGSAP } from '@/lib/gsap';
import { Canvas } from '@react-three/fiber';
import clsx from 'clsx';
import { useCallback, useRef, useState } from 'react';
import { Scene } from './Scene';

const Hero = () => {
    const [isSceneReady, setIsSceneReady] = useState(false);
    const headingTimelineRef = useRef<gsap.core.Timeline | null>(null);
    const isIntroCompleteRef = useRef(false);
    const { ref: sectionRef, isNear } = useCanvasVisibility<HTMLElement>();
    const { checkout, isPending } = useCheckout();

    const handleSceneReady = useCallback(() => setIsSceneReady(true), []);
    const handleIntroComplete = useCallback(() => {
        isIntroCompleteRef.current = true;
        headingTimelineRef.current?.play();
    }, []);
    const handleSceneError = useCallback(() => {
        handleSceneReady();
        handleIntroComplete();
    }, [handleSceneReady, handleIntroComplete]);

    useGSAP(() => {
        const mm = gsap.matchMedia();

        mm.add(MOTION_OK, () => {
            const split = SplitText.create('.hero-heading', {
                type: 'chars, lines',
                mask: 'lines',
                linesClass: 'line++',
            });

            headingTimelineRef.current = gsap
                .timeline({ paused: !isIntroCompleteRef.current })
                .from(split.chars, { opacity: 0, y: -120, ease: 'back', duration: 0.4, stagger: 0.07 })
                .to('.hero-body', { opacity: 1, duration: 0.6, ease: 'power2.out' });

            gsap.fromTo(
                '.hero-scene-fade',
                { opacity: 0 },
                {
                    opacity: 1,
                    ease: 'none',
                    scrollTrigger: { trigger: '.hero', start: 'top top', end: '50% bottom', scrub: 1 },
                },
            );

            return () => {
                headingTimelineRef.current = null;
            };
        });

        mm.add(MOTION_REDUCED, () => {
            gsap.set('.hero-heading, .hero-body', { opacity: 1 });
        });
    });

    return (
        <section
            ref={sectionRef}
            className="hero relative h-dvh text-white text-shadow-black/30 text-shadow-lg motion-safe:h-[300vh]"
        >
            <div className="hero-scene blue-gradient-bg pointer-events-none sticky top-0 h-dvh w-full">
                <div className="hero-scene-fade absolute inset-0 bg-white opacity-0" />
                <CanvasErrorBoundary onError={handleSceneError}>
                    <Canvas shadows="soft" dpr={[1, 1.5]} frameloop={isNear ? 'always' : 'never'}>
                        <Scene onReady={handleSceneReady} onIntroComplete={handleIntroComplete} />
                    </Canvas>
                </CanvasErrorBoundary>
            </div>
            <div
                className={clsx(
                    'motion-safe:transition-opacity motion-safe:duration-700',
                    isSceneReady ? 'pointer-events-none opacity-0' : 'opacity-100',
                )}
            >
                <Loader active={!isSceneReady} />
            </div>
            <div className="hero-content absolute inset-x-0 top-0 h-dvh">
                <Bounded fullWidth className="absolute inset-x-0 top-18 md:top-24 md:left-[8vw]">
                    <h1 className="hero-heading font-black-slanted text-6xl leading-[0.8] uppercase sm:text-7xl lg:text-8xl">
                        Built for
                        <br />
                        the Bold
                    </h1>
                </Bounded>
                <Bounded
                    fullWidth
                    className="hero-body absolute inset-x-0 bottom-0 opacity-0 md:right-[8vw] md:left-auto"
                    innerClassName="flex flex-col gap-3"
                >
                    <div className="max-w-md">
                        <h2 className="font-bold-slanted mb-1 text-4xl uppercase lg:mb-2 lg:text-6xl">
                            Typing Reinvented
                        </h2>
                        <p>Fall in love with the craft thanks to our professional grade keycaps and switches.</p>
                    </div>
                    <button
                        onClick={checkout}
                        disabled={isPending}
                        className="font-bold-slanted group bg-brand flex w-fit cursor-pointer items-center gap-1 rounded px-3 py-1 text-2xl uppercase transition disabled:grayscale"
                    >
                        Buy Vapor75<span className="transition group-hover:translate-x-1">{'>'}</span>
                    </button>
                </Bounded>
            </div>
        </section>
    );
};

export default Hero;
