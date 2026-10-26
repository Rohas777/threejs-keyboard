'use client';

import { Bounded } from '@/components/layout/Bounded';
import { CanvasErrorBoundary } from '@/components/three/CanvasErrorBoundary';
import { CANVAS_DEFAULTS } from '@/components/three/canvasDefaults';
import { SceneWarmUp } from '@/components/three/SceneWarmUp';
import { STAGE_ENVIRONMENT_FILES } from '@/components/three/environment';
import { Switch } from '@/components/three/Switch';
import { FadeIn } from '@/components/ui/FadeIn';
import { SwitchColor, SwitchItem, SWITCHES } from '@/data/switches';
import { useAudioPool } from '@/hooks/useAudioPool';
import { useCanvasVisibility } from '@/hooks/useCanvasVisibility';
import { useWarmUp } from '@/hooks/useWarmUp';
import { playAudio } from '@/lib/sound';
import { Stage } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import clsx from 'clsx';
import { LuVolume2 } from 'react-icons/lu';

const SOUND_VOLUME = 0.6;

const BACKGROUND_CLASSES: Record<SwitchColor, string> = {
    blue: 'bg-sky-950',
    red: 'bg-red-950',
    brown: 'bg-amber-950',
    black: 'bg-gray-900',
};

const Switches = () => {
    return (
        <Bounded className="relative" innerClassName="flex flex-col justify-center">
            <FadeIn targetChildren>
                <h2 id="switch-playground" className="font-bold-slanted scroll-mt-24 text-6xl uppercase md:text-8xl">
                    Craft your Click
                </h2>
                <p className="mb-6 max-w-4xl text-xl text-pretty">
                    The Vapor75 can be customized with one of four premium switch types.
                </p>
            </FadeIn>

            <FadeIn targetChildren className="grid grid-cols-1 gap-4 overflow-hidden sm:grid-cols-2">
                {SWITCHES.map((item) => (
                    <SwitchCard key={item.color} item={item} />
                ))}
            </FadeIn>
        </Bounded>
    );
};
export default Switches;

const SwitchCard = ({ item }: { item: SwitchItem }) => {
    const { ref, isNear, wasNear } = useCanvasVisibility<HTMLDivElement>();
    const { isDue: isWarmUpDue, markWarm } = useWarmUp();
    const pickSound = useAudioPool(item.sounds, SOUND_VOLUME);

    const handleSound = () => {
        const audio = pickSound();
        audio.currentTime = 0;
        void playAudio(audio);
    };

    return (
        <div ref={ref} className="group relative min-h-96 overflow-hidden rounded-3xl select-none">
            <button
                onClick={handleSound}
                className="font-bold-slanted absolute bottom-0 left-0 z-10 flex cursor-pointer items-center gap-3 p-6 text-4xl text-white uppercase hover:bg-white/20 focus:ring-2 focus:ring-white focus:outline-none motion-safe:transition-colors motion-safe:duration-300"
            >
                {item.name}
                <LuVolume2 />
            </button>

            {(wasNear || isWarmUpDue) && (
                <CanvasErrorBoundary onError={markWarm}>
                    <Canvas
                        camera={{ position: [1.5, 2, 0], fov: 7 }}
                        {...CANVAS_DEFAULTS}
                        frameloop={isNear ? 'always' : 'never'}
                    >
                        <Stage
                            adjustCamera
                            intensity={0.5}
                            shadows={{ type: 'contact', frames: 1 }}
                            environment={{ files: STAGE_ENVIRONMENT_FILES }}
                        >
                            <Switch rotation={[0, Math.PI / 4, 0]} item={item} />
                        </Stage>
                        <SceneWarmUp onWarm={markWarm} />
                    </Canvas>
                </CanvasErrorBoundary>
            )}

            <div
                className={clsx(
                    'font-black-slanted absolute inset-0 -z-10 grid place-items-center text-8xl uppercase',
                    BACKGROUND_CLASSES[item.color],
                )}
            >
                <svg className="pointer-events-none h-auto w-full" viewBox="0 0 75 100">
                    <text
                        x="50%"
                        y="50%"
                        dominantBaseline="middle"
                        textAnchor="middle"
                        fontSize={18}
                        className="font-black-slanted fill-white/30 uppercase mix-blend-overlay group-hover:fill-white/100 motion-safe:transition-all motion-safe:duration-700"
                    >
                        {Array.from({ length: 8 }, (_, index) => (
                            <tspan key={index} x={`${(index + 1) * 10}%`} dy={index === 0 ? -40 : 14}>
                                {item.color}
                                {item.color}
                                {item.color}
                            </tspan>
                        ))}
                    </text>
                </svg>
            </div>
        </div>
    );
};
