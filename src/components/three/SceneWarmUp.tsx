import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';

type SceneWarmUpProps = {
    /** Textures that are not on screen yet but will be shown later (e.g. alternative keycap sets). */
    textures?: readonly THREE.Texture[];
    /** Called once shaders are compiled, textures uploaded and the first frame rendered. */
    onWarm: () => void;
};

/**
 * Prepares a mounted scene before it is scrolled into view: compiles shaders in parallel where the browser
 * supports it, uploads textures and renders one frame, which also builds environment maps and contact shadows.
 * After that the first visible frame does no GPU set-up work.
 */
export function SceneWarmUp({ textures, onWarm }: SceneWarmUpProps) {
    const gl = useThree((state) => state.gl);
    const scene = useThree((state) => state.scene);
    const camera = useThree((state) => state.camera);
    const advance = useThree((state) => state.advance);

    useEffect(() => {
        let isCancelled = false;

        gl.compileAsync(scene, camera)
            .then(() => {
                if (isCancelled) return;
                textures?.forEach((texture) => gl.initTexture(texture));
                advance(performance.now());
            })
            .catch((error: unknown) => console.error('Scene warm-up failed', error))
            .finally(() => {
                if (!isCancelled) onWarm();
            });

        return () => {
            isCancelled = true;
        };
    }, [gl, scene, camera, advance, textures, onWarm]);

    return null;
}
