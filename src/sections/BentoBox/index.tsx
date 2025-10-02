import { Bounded } from '@/components/Bounded';
import Image from 'next/image';
import clsx from 'clsx';
import { FadeIn } from '@/components/FadeIn';

type BentoBoxItem = {
    id: number;
    size: 'small' | 'medium' | 'large';
    text: string;
    image: {
        src: string;
        alt: string;
    };
};

const BENTOBOX_ITEMS: BentoBoxItem[] = [
    {
        id: 0,
        image: { src: '/static/render_6.png', alt: 'The keyboard from underneath and the side showing the bottom' },
        size: 'large',
        text: '<strong>Full aluminum case.</strong> Premium materials for satisfying heft and durability.',
    },
    {
        id: 1,
        image: { src: '/static/render_5_angled.png', alt: 'A closeup of the customizable knob on the keyboard' },
        size: 'small',
        text: '<strong>Interchangeable knob system.</strong> Customize your control dial to click, scroll, or press.',
    },
    {
        id: 2,
        image: { src: '/static/render_2.png', alt: 'An angled view of the keyboard' },
        size: 'medium',
        text: '<strong>Cross Platform.</strong> Mac, Windows, or Linux, Nimbus adapts to your workflow.',
    },
    {
        id: 3,
        image: { src: '/static/render_9.png', alt: 'The keyboard with the switches showing' },
        size: 'medium',
        text: '<strong>Hot-Swappable Switches.</strong> Change your feel without any soldering.',
    },
    {
        id: 4,
        image: { src: '/static/render_11_2.png', alt: 'A single key illuminated and singled out' },
        size: 'small',
        text: '<strong>Custom Nimbus Keycap Profile.</strong> Designed for long coding sessions.',
    },
    {
        id: 5,
        image: {
            src: '/static/render_3.png',
            alt: 'A close up of the e-ink screen showing the battery life and bluetooth connection',
        },
        size: 'large',
        text: '<strong>E-Ink Display Screen.</strong> Show battery, status, or a custom design.',
    },
];

const BentoBox = () => {
    return (
        <Bounded>
            <FadeIn>
                <h2 id="features" className="font-bold-slanted mb-8 scroll-pt-6 text-6xl uppercase md:text-8xl">
                    Vapor75 Features
                </h2>
            </FadeIn>
            <FadeIn targetChildren className="grid grid-cols-1 gap-4 md:grid-cols-6">
                {BENTOBOX_ITEMS.map((item) => (
                    <BentoBoxItem key={item.id} item={item} />
                ))}
            </FadeIn>
        </Bounded>
    );
};
export default BentoBox;

const BentoBoxItem = ({ item }: { item: BentoBoxItem }) => {
    return (
        <div
            className={clsx(
                'relative overflow-hidden rounded-3xl',
                item.size === 'small' && 'md:col-span-2',
                item.size === 'medium' && 'md:col-span-3',
                item.size === 'large' && 'md:col-span-4',
            )}
        >
            <Image
                className="h-full w-full object-cover"
                src={item.image.src}
                alt={item.image.alt}
                width={item.size === 'small' ? 450 : item.size === 'medium' ? 650 : 850}
                height={393.75}
            />
            <div className="absolute inset-x-0 right-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-black"></div>
            <p
                className="absolute bottom-0 left-0 max-w-xl p-6 text-xl text-balance text-white"
                dangerouslySetInnerHTML={{ __html: item.text }}
            />
        </div>
    );
};
