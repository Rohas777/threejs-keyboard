import { Bounded } from '@/components/layout/Bounded';
import Image from 'next/image';
import clsx from 'clsx';
import { FadeIn } from '@/components/ui/FadeIn';

type BentoBoxItem = {
    id: number;
    size: 'small' | 'medium' | 'large';
    title: string;
    description: string;
    image: {
        src: string;
        alt: string;
    };
};

/** NOTE Matches the column spans of the 6-column grid inside the 1280px container. */
const IMAGE_SIZES: Record<BentoBoxItem['size'], string> = {
    small: '(min-width: 768px) 430px, 100vw',
    medium: '(min-width: 768px) 640px, 100vw',
    large: '(min-width: 768px) 850px, 100vw',
};

const BENTOBOX_ITEMS: BentoBoxItem[] = [
    {
        id: 0,
        image: { src: '/static/render_6.png', alt: 'The keyboard from underneath and the side showing the bottom' },
        size: 'large',
        title: 'Full aluminum case.',
        description: 'Premium materials for satisfying heft and durability.',
    },
    {
        id: 1,
        image: { src: '/static/render_5_angled.png', alt: 'A closeup of the customizable knob on the keyboard' },
        size: 'small',
        title: 'Interchangeable knob system.',
        description: 'Customize your control dial to click, scroll, or press.',
    },
    {
        id: 2,
        image: { src: '/static/render_2.png', alt: 'An angled view of the keyboard' },
        size: 'medium',
        title: 'Cross Platform.',
        description: 'Mac, Windows, or Linux, Nimbus adapts to your workflow.',
    },
    {
        id: 3,
        image: { src: '/static/render_9.png', alt: 'The keyboard with the switches showing' },
        size: 'medium',
        title: 'Hot-Swappable Switches.',
        description: 'Change your feel without any soldering.',
    },
    {
        id: 4,
        image: { src: '/static/render_11_2.png', alt: 'A single key illuminated and singled out' },
        size: 'small',
        title: 'Custom Nimbus Keycap Profile.',
        description: 'Designed for long coding sessions.',
    },
    {
        id: 5,
        image: {
            src: '/static/render_3.png',
            alt: 'A close up of the e-ink screen showing the battery life and bluetooth connection',
        },
        size: 'large',
        title: 'E-Ink Display Screen.',
        description: 'Show battery, status, or a custom design.',
    },
];

const BentoBox = () => {
    return (
        <Bounded>
            <FadeIn>
                <h2 id="features" className="font-bold-slanted mb-8 scroll-mt-24 text-6xl uppercase md:text-8xl">
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
                sizes={IMAGE_SIZES[item.size]}
            />
            <div className="absolute inset-x-0 right-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-black"></div>
            <p className="absolute bottom-0 left-0 max-w-xl p-6 text-xl text-balance text-white">
                <strong>{item.title}</strong> {item.description}
            </p>
        </div>
    );
};
