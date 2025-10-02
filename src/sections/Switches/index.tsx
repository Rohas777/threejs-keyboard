'use client';

import { Bounded } from '@/components/Bounded';
import clsx from 'clsx';
import { FadeIn } from '@/components/FadeIn';
import { Canvas } from '@react-three/fiber';
import { SOUND_MAP, Switch } from '@/components/Switch';
import { Stage } from '@react-three/drei';
import gsap from 'gsap';
import { LuVolume2 } from 'react-icons/lu';

type SwitchesItem = {
    id: number;
    uid: 'red' | 'brown' | 'black' | 'blue';
    name: string;
    color: string;
};

const SWITCHES_ITEMS: SwitchesItem[] = [
    {
        id: 0,
        uid: 'red',
        name: 'Red Max',
        color: '#C92627',
    },
    {
        id: 1,
        uid: 'brown',
        name: 'Brown Max',
        color: '#6E3205',
    },
    {
        id: 2,
        uid: 'blue',
        name: 'Blue Max',
        color: '#0F80E7',
    },
    {
        id: 3,
        uid: 'black',
        name: 'Black Max',
        color: '#000000',
    },
];

const Switches = () => {
    return (
        <Bounded className="relative" innerClassName="flex flex-col justify-center">
            <FadeIn targetChildren>
                <h2 id="switch-playground" className="font-bold-slanted scroll-pt-6 text-6xl uppercase md:text-8xl">
                    Craft your Click
                </h2>
                <p className="mb-6 max-w-4xl text-xl text-pretty">
                    The Vapor75 can be customized with one of four premium switch types.
                </p>
            </FadeIn>

            <FadeIn targetChildren className="grid grid-cols-1 gap-4 overflow-hidden sm:grid-cols-2">
                {SWITCHES_ITEMS.map((item) => (
                    <SharedCanvas key={item.id} switchItem={item} />
                ))}
            </FadeIn>
        </Bounded>
    );
};
export default Switches;

const SharedCanvas = ({ switchItem }: { switchItem: SwitchesItem }) => {
    const bgColor = {
        blue: 'bg-sky-950',
        red: 'bg-red-950',
        brown: 'bg-amber-950',
        black: 'bg-gray-900',
    }[switchItem.uid];

    const handleSound = () => {
        const selectedSound = gsap.utils.random(SOUND_MAP[switchItem.uid]);
        const audio = new Audio(selectedSound);
        audio.volume = 0.6;
        audio.currentTime = 0;
        audio.play();
    };

    return (
        <div className="group relative min-h-96 overflow-hidden rounded-3xl select-none">
            <button
                onClick={handleSound}
                className="font-bold-slanted absolute bottom-0 left-0 z-10 flex cursor-pointer items-center gap-3 p-6 text-4xl text-white uppercase hover:bg-white/20 focus:ring-2 focus:ring-white focus:outline-none motion-safe:transition-colors motion-safe:duration-300"
            >
                {switchItem.name}
                <LuVolume2 />
            </button>

            <Canvas camera={{ position: [1.5, 2, 0], fov: 7 }}>
                <Stage adjustCamera intensity={0.5} shadows="contact" environment="city">
                    <Switch rotation={[0, Math.PI / 4, 0]} color={switchItem.uid} hexColor={switchItem.color} />
                </Stage>
            </Canvas>

            <div
                className={clsx(
                    'font-black-slanted absolute inset-0 -z-10 grid place-items-center text-8xl uppercase',
                    bgColor,
                )}
            >
                <svg className="pointer-events-none h-auto w-full" viewBox="0 0 75 100">
                    <text
                        x="50%"
                        y="50%"
                        dominantBaseline="middle"
                        textAnchor="middle"
                        fontSize={18}
                        className="font-black-slanted motion-safe:transition-full fill-white/30 uppercase mix-blend-overlay group-hover:fill-white/100 motion-safe:duration-700"
                    >
                        {Array.from({ length: 8 }, (_, index) => (
                            <tspan key={index} x={`${(index + 1) * 10}%`} dy={index === 0 ? -40 : 14}>
                                {switchItem.uid}
                                {switchItem.uid}
                                {switchItem.uid}
                            </tspan>
                        ))}
                    </text>
                </svg>
            </div>
        </div>
    );
};
