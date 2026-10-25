import { LogoMark } from '@/components/ui/LogoMark';
import clsx from 'clsx';
import { Fragment } from 'react';

const MARQUEE_PHRASES = ['Joyful Experience', 'Quality Materials', 'Precision Crafting'];
const MARQUEE_COPIES = 4;

const MarqueeContent = () => (
    <div className="flex items-center bg-gray-200 py-10 whitespace-nowrap">
        {MARQUEE_PHRASES.map((phrase) => (
            <Fragment key={phrase}>
                <div className="font-bold-slanted px-14 text-[180px] leading-none text-gray-400/80 uppercase [text-box:trim-both_cap_alphabetic] md:text-[260px]">
                    {phrase}
                </div>
                <LogoMark className="size-36 shrink-0" />
            </Fragment>
        ))}
    </div>
);

const Marquee = ({ direction = 'left' }: { direction?: 'right' | 'left' }) => {
    return (
        <section
            className="relative flex w-full items-center overflow-hidden select-none"
            aria-hidden="true"
            role="presentation"
        >
            <div className="relative flex items-center whitespace-nowrap">
                <div className={clsx('animate-marquee flex', direction === 'right' && '[animation-direction:reverse]')}>
                    {Array.from({ length: MARQUEE_COPIES }, (_, index) => (
                        <MarqueeContent key={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};
export default Marquee;
