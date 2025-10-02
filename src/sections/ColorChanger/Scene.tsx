'use client';

import { Keyboard } from '@/components/Keyboard';
import { Stage, useTexture } from '@react-three/drei';
import { KEYCAP_TEXTURES } from '.';
import { useCallback, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

gsap.registerPlugin(useGSAP);

type SceneProps = {
    selectedTextureId: string;
    onAnimationComplete: () => void;
};

export const Scene = ({ selectedTextureId, onAnimationComplete }: SceneProps) => {
    const texturePaths = KEYCAP_TEXTURES.map((t) => t.path);
    const textures = useTexture(texturePaths);

    const changeKnobColor = useCallback(() => {
        return KEYCAP_TEXTURES.find((t) => t.id === selectedTextureId)?.knobColor || KEYCAP_TEXTURES[0].knobColor;
    }, [selectedTextureId]);

    const [currentTextureId, setCurrentTextureId] = useState(selectedTextureId);
    const [currentKnobColor, setCurrentKnobColor] = useState(changeKnobColor());

    const keyboardRef = useRef<THREE.Group>(null);

    useGSAP(() => {
        if (!keyboardRef.current || selectedTextureId === currentTextureId) return;

        const mm = gsap.matchMedia();
        mm.add('(prefers-reduced-motion: no-preference)', () => {
            const keyboard = keyboardRef.current;
            if (!keyboard) return;

            const tl = gsap.timeline({
                onComplete: () => {
                    onAnimationComplete();
                },
            });
            tl.to(keyboard.position, {
                y: 0.3,
                duration: 0.4,
                ease: 'power2.out',
                onComplete: () => {
                    setCurrentTextureId(selectedTextureId);
                    setCurrentKnobColor(changeKnobColor());
                },
            });
            tl.to(keyboard.position, { y: 0, duration: 0.6, ease: 'elastic.out(1,0.4)' });
        });

        mm.add('(prefers-reduced-motion: reduce)', () => {
            setCurrentTextureId(selectedTextureId);
            onAnimationComplete();
        });
    }, [selectedTextureId, currentTextureId]);

    const materials = useMemo(() => {
        const materialMap: { [key: string]: THREE.MeshStandardMaterial } = {};

        KEYCAP_TEXTURES.forEach((textureConfig, index) => {
            const texture = Array.isArray(textures) ? textures[index] : textures;

            if (texture) {
                texture.flipY = false;
                texture.colorSpace = THREE.SRGBColorSpace;
                texture.minFilter = THREE.LinearFilter;

                materialMap[textureConfig.id] = new THREE.MeshStandardMaterial({
                    map: texture,
                    roughness: 0.7,
                });
            }
        });

        return materialMap;
    }, [textures]);

    return (
        <Stage environment={{ environmentIntensity: 0.6, preset: 'city' }} intensity={0.0001} shadows="contact">
            <group ref={keyboardRef}>
                <Keyboard keycapMaterial={materials[currentTextureId]} knobColor={currentKnobColor} />
            </group>
        </Stage>
    );
};
