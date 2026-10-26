'use client';

import { Keyboard, KeyboardHandle } from '@/components/three/Keyboard';
import { Keycap } from '@/components/three/Keycap';
import { SceneWarmUp } from '@/components/three/SceneWarmUp';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { gsap, MOTION_OK, MOTION_REDUCED, settleOnFirstRefresh, useGSAP } from '@/lib/gsap';
import { waveStartTimes } from '@/lib/wave';
import { Environment, PerspectiveCamera } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { INTRO_END_POSE, shouldPlayIntro } from './intro';

const ENVIRONMENT_FILES = ['/hdr/blue-studio.hdr'];

const CAMERA_POSITION = new THREE.Vector3(0, 0, 4);
const CAMERA_TILT = 0.3;
/** NOTE Equals moving 10% of the remaining distance per frame at 60 fps, independent of the frame rate. */
const CAMERA_DAMPING = -Math.log(0.9) * 60;

const SPOT_INTENSITY = 30;
const ENVIRONMENT_INTENSITY = 0.2;

const KEYCAP_LIFT = 0.08;
const SWITCH_LIFT = 0.04;
const WAVE_OFFSET = 0.5;
const WAVE_SPREAD = 2;

const CameraController = () => {
    const camera = useThree((state) => state.camera);
    const pointerRef = useRef({ x: 0.5, y: 0.5 });
    const target = useMemo(() => new THREE.Vector3(0, 0, 0), []);
    const current = useMemo(() => CAMERA_POSITION.clone(), []);
    const prefersReducedMotion = usePrefersReducedMotion();

    useFrame((_, delta) => {
        if (prefersReducedMotion) {
            camera.position.copy(CAMERA_POSITION);
            camera.lookAt(target);
            return;
        }

        const { x, y } = pointerRef.current;
        current.x = THREE.MathUtils.damp(current.x, CAMERA_POSITION.x + (x - 0.5) * CAMERA_TILT, CAMERA_DAMPING, delta);
        current.y = THREE.MathUtils.damp(current.y, CAMERA_POSITION.y - (y - 0.5) * CAMERA_TILT, CAMERA_DAMPING, delta);

        camera.position.copy(current);
        camera.lookAt(target);
    });

    useEffect(() => {
        if (prefersReducedMotion) return;

        const handlePointerMove = (event: PointerEvent) => {
            pointerRef.current.x = event.clientX / window.innerWidth;
            pointerRef.current.y = event.clientY / window.innerHeight;
        };

        window.addEventListener('pointermove', handlePointerMove);
        return () => window.removeEventListener('pointermove', handlePointerMove);
    }, [prefersReducedMotion]);

    return null;
};

/**
 * NOTE drei's Environment re-applies `environmentIntensity` on every render, which would override the intro
 * fade-in; memoization keeps it from re-rendering, so the intensity on the scene stays owned by GSAP.
 */
const HeroEnvironment = memo(function HeroEnvironment({ intensity }: { intensity: number }) {
    return <Environment files={ENVIRONMENT_FILES} environmentIntensity={intensity} />;
});

function addScrollTimeline(keyboard: THREE.Group, keycaps: THREE.Group, handle: KeyboardHandle) {
    const scrollTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
            ...settleOnFirstRefresh(),
        },
    });

    scrollTimeline
        .to(keyboard.position, { x: 0, y: -0.5, z: 2.2 })
        .to(keyboard.rotation, { x: Math.PI * -2 + 0.8, y: 0, z: 0 }, '<')
        .to(keycaps.scale, { x: 5, y: 5, z: 5, duration: 3 }, 0);

    const keyboardKeycaps = handle.getKeycaps();
    const switchXs = handle.getSwitchXs();
    const switchLifts = switchXs.map(() => ({ y: 0 }));
    const starts = waveStartTimes([...keyboardKeycaps.map(({ x }) => x), ...switchXs], WAVE_OFFSET, WAVE_SPREAD);
    const wave = { duration: 0.5, ease: 'power2.inOut' };
    const switchWave = { duration: 0.3, ease: 'power2.inOut' };

    keyboardKeycaps.forEach(({ mesh }, index) => {
        const start = starts[index];
        const restY = mesh.position.y;
        scrollTimeline
            .to(mesh.position, { ...wave, y: restY + KEYCAP_LIFT }, start)
            .to(mesh.position, { ...wave, y: restY }, start + 0.5);
    });

    switchLifts.forEach((lift, index) => {
        const start = starts[keyboardKeycaps.length + index];
        scrollTimeline
            .to(lift, { ...switchWave, y: SWITCH_LIFT }, start + 0.2)
            .to(lift, { ...switchWave, y: 0 }, start + 0.5);
    });

    scrollTimeline.eventCallback('onUpdate', () => handle.setSwitchLifts(switchLifts));
}

type SceneProps = {
    /** Called once the assets are loaded and the scene is compiled and rendered for the first time. */
    onReady: () => void;
    /** Called when the intro animation finishes; not called when the intro is skipped. */
    onIntroComplete: () => void;
};

export const Scene = ({ onReady, onIntroComplete }: SceneProps) => {
    const keyboardGroupRef = useRef<THREE.Group>(null);
    const keycapGroupRef = useRef<THREE.Group>(null);
    const keyboardRef = useRef<KeyboardHandle>(null);
    const spotLightRef = useRef<THREE.SpotLight>(null);
    const scene = useThree((state) => state.scene);
    const viewportWidth = useThree((state) => state.size.width);
    // NOTE The scene starts dark when the intro plays, so the first rendered frame already matches the fade-in.
    const [lightScale] = useState(() => (shouldPlayIntro() ? 0 : 1));
    const [isWarm, setIsWarm] = useState(false);
    const handleWarm = useCallback(() => setIsWarm(true), []);

    useEffect(() => {
        if (isWarm) onReady();
    }, [isWarm, onReady]);

    useGSAP(
        () => {
            if (!isWarm) return;
            const mm = gsap.matchMedia();

            mm.add(MOTION_OK, (context) => {
                const keyboard = keyboardGroupRef.current;
                const keycaps = keycapGroupRef.current;
                const spotLight = spotLightRef.current;
                const handle = keyboardRef.current;
                if (!keyboard || !keycaps || !spotLight || !handle) return;

                if (!shouldPlayIntro()) {
                    gsap.set(keyboard.position, INTRO_END_POSE.position);
                    gsap.set(keyboard.rotation, INTRO_END_POSE.rotation);
                    addScrollTimeline(keyboard, keycaps, handle);
                    return;
                }

                const lightIn = { duration: 3.5, delay: 0.5, ease: 'power2.inOut' };
                gsap.to(spotLight, { ...lightIn, intensity: SPOT_INTENSITY });
                gsap.to(scene, { ...lightIn, environmentIntensity: ENVIRONMENT_INTENSITY });

                gsap.timeline({ defaults: { ease: 'power2.inOut' } })
                    .to(keyboard.position, { x: 0, y: -0.5, z: 0.5, duration: 2 })
                    .to(keyboard.rotation, { x: 1.4, y: 0, z: 0, duration: 1.8 }, '<')
                    .to(keyboard.position, { ...INTRO_END_POSE.position, duration: 2, delay: 0.5 })
                    .to(keyboard.rotation, { ...INTRO_END_POSE.rotation, duration: 2 }, '<')
                    .call(() => {
                        onIntroComplete();
                        context.add(() => addScrollTimeline(keyboard, keycaps, handle));
                    });
            });

            mm.add(MOTION_REDUCED, () => {
                if (spotLightRef.current) gsap.set(spotLightRef.current, { intensity: SPOT_INTENSITY });
                gsap.set(scene, { environmentIntensity: ENVIRONMENT_INTENSITY });
            });
        },
        { dependencies: [scene, onIntroComplete, isWarm], revertOnUpdate: true },
    );

    const scalingFactor = viewportWidth <= 500 ? 0.5 : 1;

    return (
        <group>
            <CameraController />
            <PerspectiveCamera position={CAMERA_POSITION.toArray()} fov={50} makeDefault />

            <group scale={scalingFactor}>
                <group ref={keyboardGroupRef}>
                    <Keyboard ref={keyboardRef} scale={9} />
                </group>

                <group ref={keycapGroupRef}>
                    <Keycap position={[0, -0.4, 2.6]} rotation={[0, 2, 3]} texture={0} />
                    <Keycap position={[-1.4, 0, 2.3]} rotation={[3, 2, 1]} texture={1} />
                    <Keycap position={[-1.8, 1, 1.5]} rotation={[0, 1, 3]} texture={2} />
                    <Keycap position={[0, 1, 1]} rotation={[0, 4, 2]} texture={3} />
                    <Keycap position={[0.7, 0.9, 1.4]} rotation={[3, 2, 0]} texture={4} />
                    <Keycap position={[1.3, -0.3, 2.3]} rotation={[1, 2, 0]} texture={5} />
                    <Keycap position={[0, 1, 2]} rotation={[2, 2, 3]} texture={6} />
                    <Keycap position={[-0.7, 0.6, 2]} rotation={[1, 4, 0]} texture={7} />
                    <Keycap position={[-0.77, 0.1, 2.8]} rotation={[3, 2, 3]} texture={8} />
                    <Keycap position={[2, 0, 1]} rotation={[0, 0, 3]} texture={7} />
                </group>
            </group>

            <HeroEnvironment intensity={ENVIRONMENT_INTENSITY * lightScale} />
            {/* NOTE Shaders compile before the first visible frame, while the loader still covers the scene. */}
            <SceneWarmUp onWarm={handleWarm} />
            <spotLight
                ref={spotLightRef}
                position={[-2, 1.5, 3]}
                intensity={SPOT_INTENSITY * lightScale}
                castShadow
                shadow-bias={-0.0002}
                shadow-normalBias={0.002}
                shadow-mapSize={2048}
            />
        </group>
    );
};
