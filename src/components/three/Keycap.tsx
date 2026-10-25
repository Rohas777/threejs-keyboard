import { FLOATING_KEYCAP_TEXTURES, FloatingKeycapTexture } from '@/data/keycapTextures';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { Float, useGLTF, useTexture } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACO_DECODER_PATH } from './draco';

const MODEL_PATH = '/keycap.gltf';

type KeycapProps = {
    position?: [number, number, number];
    rotation?: [number, number, number];
    texture?: FloatingKeycapTexture;
};

type GLTFResult = GLTF & {
    nodes: { Keycap: THREE.Mesh };
};

export function Keycap({ position = [0, 0, 0], rotation = [0, 0, 0], texture = 0 }: KeycapProps) {
    // NOTE Node names come from the GLTF file, so the loader cannot type them.
    const { nodes } = useGLTF(MODEL_PATH, DRACO_DECODER_PATH) as unknown as GLTFResult;
    const keycapTexture = useTexture(FLOATING_KEYCAP_TEXTURES[texture]);
    const prefersReducedMotion = usePrefersReducedMotion();

    const material = useMemo(() => {
        keycapTexture.flipY = false;
        keycapTexture.colorSpace = THREE.SRGBColorSpace;
        return new THREE.MeshStandardMaterial({ map: keycapTexture, roughness: 0.7 });
    }, [keycapTexture]);

    useEffect(() => () => material.dispose(), [material]);

    return (
        <Float
            speed={prefersReducedMotion ? 0 : 1}
            rotationIntensity={prefersReducedMotion ? 0 : 3}
            floatIntensity={prefersReducedMotion ? 0 : 1}
            position={position}
            rotation={rotation}
        >
            {/* NOTE Geometry belongs to the shared useGLTF cache and must outlive this component. */}
            <group dispose={null}>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Keycap.geometry}
                    material={material}
                    rotation={[Math.PI / 2, 0, 0]}
                    scale={10}
                />
            </group>
        </Float>
    );
}

useGLTF.preload(MODEL_PATH, DRACO_DECODER_PATH);
