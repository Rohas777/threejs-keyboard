'use client';

import { Keyboard } from '@/components/three/Keyboard';
import { SceneWarmUp } from '@/components/three/SceneWarmUp';
import { STAGE_ENVIRONMENT_FILES } from '@/components/three/environment';
import { DEFAULT_KEYCAP_TEXTURE, KEYCAP_TEXTURES } from '@/data/keycapTextures';
import { gsap, MOTION_OK, MOTION_REDUCED, useGSAP } from '@/lib/gsap';
import { holdWarmUp } from '@/lib/warmUp';
import { ContactShadows, Stage, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

const JUMP_HEIGHT = 0.3;
/** How much wider the shadow gets when the keyboard is at the top of its jump. */
const SHADOW_SPREAD = 0.3;

type StageBounds = { radius: number; height: number };

/** Shadow strength from 0 (keyboard in the air) to 1 (keyboard on the ground), animated by the jump timeline. */
type ShadowState = { strength: number };

/**
 * Contact shadow of the keyboard, rendered once and then only faded and spread by {@link ShadowState},
 * so it dissolves while the keyboard jumps up and returns while the next one lands.
 * NOTE Memoized: drei's ContactShadows resets its frame counter on every render and re-captures the shadow,
 * which would capture an empty one while the keyboard is in the air (the keycap swap re-renders the scene).
 */
const JumpShadow = memo(function JumpShadow({
    bounds,
    shadowState,
}: {
    bounds: StageBounds;
    shadowState: ShadowState;
}) {
    const shadowRef = useRef<THREE.Group>(null);
    const materialRef = useRef<THREE.Material | null>(null);

    const handleShadowRef = useCallback((group: THREE.Group | null) => {
        shadowRef.current = group;
        const plane = group?.children.find((child): child is THREE.Mesh => child instanceof THREE.Mesh);
        materialRef.current = plane && !Array.isArray(plane.material) ? plane.material : null;
    }, []);

    useFrame(() => {
        const shadow = shadowRef.current;
        const material = materialRef.current;
        if (!shadow || !material) return;

        material.opacity = shadowState.strength;
        shadow.scale.setScalar(1 + (1 - shadowState.strength) * SHADOW_SPREAD);
    });

    return (
        <ContactShadows
            ref={handleShadowRef}
            position={[0, -bounds.height / 2, 0]}
            scale={bounds.radius * 4}
            far={bounds.radius}
            blur={2}
            frames={1}
        />
    );
});

type SceneProps = {
    selectedTextureId: string;
    onAnimationComplete: () => void;
    /** Called once the scene, including every keycap set, is ready to render without GPU set-up work. */
    onWarm: () => void;
};

function knobColorOf(textureId: string) {
    return (KEYCAP_TEXTURES.find((texture) => texture.id === textureId) ?? DEFAULT_KEYCAP_TEXTURE).knobColor;
}

export const Scene = ({ selectedTextureId, onAnimationComplete, onWarm }: SceneProps) => {
    const textures = useTexture(KEYCAP_TEXTURES.map((texture) => texture.path));
    const [currentTextureId, setCurrentTextureId] = useState(selectedTextureId);
    const appliedTextureIdRef = useRef(selectedTextureId);
    const keyboardRef = useRef<THREE.Group>(null);
    const [shadowState] = useState<ShadowState>(() => ({ strength: 1 }));
    const [bounds, setBounds] = useState<StageBounds | null>(null);

    const handleCentered = useCallback(
        ({ height, boundingSphere }: { height: number; boundingSphere: THREE.Sphere }) =>
            setBounds((previous) =>
                previous?.radius === boundingSphere.radius && previous.height === height
                    ? previous
                    : { radius: boundingSphere.radius, height },
            ),
        [],
    );

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

                // NOTE Warm-up of other canvases is a long main-thread task; it waits so the jump never skips frames.
                const releaseWarmUp = holdWarmUp();
                const finish = () => {
                    releaseWarmUp();
                    onAnimationComplete();
                };

                gsap.timeline({ onComplete: finish })
                    .to(keyboard.position, {
                        y: JUMP_HEIGHT,
                        duration: 0.4,
                        ease: 'power2.out',
                        onComplete: applySelection,
                    })
                    .to(shadowState, { strength: 0, duration: 0.4, ease: 'power2.out' }, 0)
                    .to(keyboard.position, { y: 0, duration: 0.6, ease: 'elastic.out(1,0.4)' }, 0.4)
                    .to(shadowState, { strength: 1, duration: 0.35, ease: 'sine.out' }, 0.4);

                return releaseWarmUp;
            });

            mm.add(MOTION_REDUCED, () => {
                applySelection();
                onAnimationComplete();
            });
        },
        { dependencies: [selectedTextureId, shadowState], revertOnUpdate: true },
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
    const keycapMaps = useMemo(
        () => Array.from(materials.values(), (material) => material.map).filter((map) => map !== null),
        [materials],
    );

    useEffect(
        () => () =>
            materials.forEach((material) => {
                material.map?.dispose();
                material.dispose();
            }),
        [materials],
    );

    return (
        <>
            <Stage
                environment={{ environmentIntensity: 0.6, files: STAGE_ENVIRONMENT_FILES }}
                intensity={0.0001}
                shadows={false}
                center={{ onCentered: handleCentered }}
            >
                <group ref={keyboardRef}>
                    <Keyboard
                        keycapMaterial={materials.get(currentTextureId)}
                        knobColor={knobColorOf(currentTextureId)}
                    />
                </group>
            </Stage>
            {bounds && (
                <>
                    <JumpShadow bounds={bounds} shadowState={shadowState} />
                    <SceneWarmUp textures={keycapMaps} onWarm={onWarm} />
                </>
            )}
        </>
    );
};
