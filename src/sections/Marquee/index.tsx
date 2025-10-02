'use client';

import { LogoMark } from '@/components/LogoMark';
import clsx from 'clsx';
import { Fragment } from 'react';

const MARQUEE_PHRASES = [{ text: 'Joyful Experience' }, { text: 'Quality Materials' }, { text: 'Precision Crafting' }];

const Marquee = ({ direction = 'left' }: { direction?: 'right' | 'left' }) => {
    const MarqueeContent = () => (
        <div className="flex items-center bg-gray-200 py-10 whitespace-nowrap">
            {MARQUEE_PHRASES.map((phrase, i) => (
                <Fragment key={i}>
                    <div className="font-bold-slanted px-14 text-[180px] leading-none text-gray-400/80 uppercase [text-box:trim-both_cap_alphabetic] md:text-[260px]">
                        {phrase.text}
                    </div>
                    <LogoMark className="size-36 shrink-0" />
                </Fragment>
            ))}
        </div>
    );

    return (
        <section
            className="relative flex w-full items-center overflow-hidden select-none"
            aria-hidden="true"
            role="presentation"
        >
            <div className="relative flex items-center whitespace-nowrap">
                <div
                    className={clsx(
                        'marquee-track animate-marquee flex',
                        direction === 'right' && '[animation-direction:reverse]',
                    )}
                >
                    <MarqueeContent />
                    <MarqueeContent />
                    <MarqueeContent />
                    <MarqueeContent />
                </div>
            </div>
        </section>
    );
};
export default Marquee;
