'use client';

import { Keyboard } from '@/components/three/Keyboard';
import { STAGE_ENVIRONMENT_FILES } from '@/components/three/environment';
import { DEFAULT_KEYCAP_TEXTURE, KEYCAP_TEXTURES } from '@/data/keycapTextures';
import { gsap, MOTION_OK, MOTION_REDUCED, useGSAP } from '@/lib/gsap';
import { Stage, useTexture } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

type SceneProps = {
    selectedTextureId: string;
    onAnimationComplete: () => void;
};

function knobColorOf(textureId: string) {
    return (KEYCAP_TEXTURES.find((texture) => texture.id === textureId) ?? DEFAULT_KEYCAP_TEXTURE).knobColor;
}

export const Scene = ({ selectedTextureId, onAnimationComplete }: SceneProps) => {
    const textures = useTexture(KEYCAP_TEXTURES.map((texture) => texture.path));
    const [currentTextureId, setCurrentTextureId] = useState(selectedTextureId);
    const appliedTextureIdRef = useRef(selectedTextureId);
    const keyboardRef = useRef<THREE.Group>(null);

    useGSAP(
        () => {
            if (selectedTextureId === appliedTextureIdRef.current) return;

            const applySelection = () => {
                appliedTextureIdRef.current = selectedTextureId;
                setCurrentTextureId(selectedTextureId);
            };

            const mm = gsap.matchMedia();

            mm.add(MOTION_OK, () => {
                const keyboard = keyboardRef.current;
                if (!keyboard) return;

                gsap.timeline({ onComplete: onAnimationComplete })
                    .to(keyboard.position, { y: 0.3, duration: 0.4, ease: 'power2.out', onComplete: applySelection })
                    .to(keyboard.position, { y: 0, duration: 0.6, ease: 'elastic.out(1,0.4)' });
            });

            mm.add(MOTION_REDUCED, () => {
                applySelection();
                onAnimationComplete();
            });
        },
        { dependencies: [selectedTextureId], revertOnUpdate: true },
    );

    const materials = useMemo(() => {
        const materialMap = new Map<string, THREE.MeshStandardMaterial>();

        KEYCAP_TEXTURES.forEach((textureConfig, index) => {
            // NOTE A clone shares the decoded image but keeps the filter settings local to this scene,
            // so the cached texture used by the hero keyboard stays untouched.
            const texture = textures[index].clone();
            texture.flipY = false;
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.minFilter = THREE.LinearFilter;
            materialMap.set(textureConfig.id, new THREE.MeshStandardMaterial({ map: texture, roughness: 0.7 }));
        });

        return materialMap;
    }, [textures]);

    useEffect(
        () => () =>
            materials.forEach((material) => {
                material.map?.dispose();
                material.dispose();
            }),
        [materials],
    );

    return (
        <Stage
            environment={{ environmentIntensity: 0.6, files: STAGE_ENVIRONMENT_FILES }}
            intensity={0.0001}
            shadows={{ type: 'contact', frames: 1 }}
        >
            <group ref={keyboardRef}>
                <Keyboard keycapMaterial={materials.get(currentTextureId)} knobColor={knobColorOf(currentTextureId)} />
            </group>
        </Stage>
    );
};
