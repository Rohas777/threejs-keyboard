import { SwitchItem } from '@/data/switches';
import { useAudioPool } from '@/hooks/useAudioPool';
import { gsap } from '@/lib/gsap';
import { playAudio } from '@/lib/sound';
import { useGLTF } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACO_DECODER_PATH } from './draco';

const MODEL_PATH = '/switch.gltf';
const SOUND_VOLUME = 0.6;

type GLTFResult = GLTF & {
    nodes: {
        Single_Switch_Mesh_1: THREE.Mesh;
        Single_Switch_Mesh_2: THREE.Mesh;
        Single_Switch_Mesh_3: THREE.Mesh;
        Single_Switch_Mesh_4: THREE.Mesh;
    };
};

type SwitchProps = React.ComponentProps<'group'> & {
    item: SwitchItem;
};

/** Interactive switch: press plays the first half of a click sound, release plays the rest. */
export function Switch({ item, ...restProps }: SwitchProps) {
    // NOTE Node names come from the GLTF file, so the loader cannot type them.
    const { nodes } = useGLTF(MODEL_PATH, DRACO_DECODER_PATH) as unknown as GLTFResult;

    const switchGroupRef = useRef<THREE.Group>(null);
    const stemRef = useRef<THREE.Mesh>(null);
    const isPressedRef = useRef(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
    const pickSound = useAudioPool(item.sounds, SOUND_VOLUME);

    useEffect(
        () => () => {
            clearTimeout(pauseTimeoutRef.current);
            document.body.style.cursor = '';
        },
        [],
    );

    const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();

        if (!stemRef.current || !switchGroupRef.current || isPressedRef.current) return;
        isPressedRef.current = true;

        gsap.killTweensOf(stemRef.current.position);
        gsap.killTweensOf(switchGroupRef.current.rotation);
        gsap.to(switchGroupRef.current.rotation, { x: Math.PI / 2 + 0.1, duration: 0.05, ease: 'power2.out' });
        gsap.to(stemRef.current.position, { z: 0.005, duration: 0.08, ease: 'power2.out' });

        const audio = pickSound();
        audioRef.current = audio;
        audio.currentTime = 0;
        void playAudio(audio);

        clearTimeout(pauseTimeoutRef.current);
        // NOTE Duration is NaN until metadata loads; then the sound plays through without the press/release split.
        if (Number.isFinite(audio.duration)) {
            pauseTimeoutRef.current = setTimeout(() => audio.pause(), (audio.duration / 2) * 1000);
        }
    };

    const releaseSwitch = () => {
        if (!stemRef.current || !switchGroupRef.current || !isPressedRef.current) return;
        isPressedRef.current = false;

        gsap.to(switchGroupRef.current.rotation, { x: Math.PI / 2, duration: 0.6, ease: 'elastic.out(1, 0.3)' });
        gsap.to(stemRef.current.position, { z: 0, duration: 0.15, ease: 'elastic.out(1, 0.3)' });

        clearTimeout(pauseTimeoutRef.current);
        const audio = audioRef.current;
        if (audio?.paused) void playAudio(audio);
    };

    const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        releaseSwitch();
    };

    return (
        <group {...restProps}>
            <mesh
                position={[0, 0.05, 0]}
                onPointerOver={() => (document.body.style.cursor = 'pointer')}
                onPointerOut={() => (document.body.style.cursor = '')}
                onPointerLeave={releaseSwitch}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
            >
                <boxGeometry args={[0.15, 0.15, 0.15]} />
                <meshBasicMaterial transparent opacity={0} />
            </mesh>

            <group ref={switchGroupRef} scale={10} rotation={[Math.PI / 2, 0, 0]}>
                <mesh castShadow receiveShadow geometry={nodes.Single_Switch_Mesh_1.geometry}>
                    <meshStandardMaterial color="#999999" roughness={0.7} />
                </mesh>
                <mesh castShadow receiveShadow geometry={nodes.Single_Switch_Mesh_2.geometry}>
                    <meshStandardMaterial color="#ffd700" roughness={0.1} metalness={1} />
                </mesh>
                <mesh ref={stemRef} castShadow receiveShadow geometry={nodes.Single_Switch_Mesh_3.geometry}>
                    <meshStandardMaterial color={item.hexColor} roughness={0.7} />
                </mesh>
                <mesh castShadow receiveShadow geometry={nodes.Single_Switch_Mesh_4.geometry}>
                    <meshStandardMaterial color="#999999" roughness={0.7} />
                </mesh>
            </group>
        </group>
    );
}

useGLTF.preload(MODEL_PATH, DRACO_DECODER_PATH);
