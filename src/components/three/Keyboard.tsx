import { DEFAULT_KEYCAP_TEXTURE } from '@/data/keycapTextures';
import { useGLTF, useTexture } from '@react-three/drei';
import { useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { KEYCAP_LAYOUT, KeycapNode, SWITCHES_ORIGIN } from './keyboardLayout';
import { DRACO_DECODER_PATH } from './draco';

const MODEL_PATH = '/keyboard.gltf';

type GLTFResult = GLTF & {
    nodes: Record<KeycapNode, THREE.Mesh> & {
        Plate: THREE.Mesh;
        Knob: THREE.Mesh;
        PCB: THREE.Mesh;
        ['625u_Wire001']: THREE.Mesh;
        Cube005: THREE.Mesh;
        Cube005_1: THREE.Mesh;
        Top_Case: THREE.Mesh;
        Weight: THREE.Mesh;
        Screen: THREE.Mesh;
        Switch_Heavy002: THREE.InstancedMesh;
        Switch_Heavy002_1: THREE.InstancedMesh;
        Switch_Heavy002_2: THREE.InstancedMesh;
        Switch_Heavy002_3: THREE.InstancedMesh;
        ['2U_Wires']: THREE.InstancedMesh;
        Stab_Housing_Instances: THREE.InstancedMesh;
    };
    materials: {
        Gold: THREE.MeshStandardMaterial;
        Stem: THREE.MeshStandardMaterial;
    };
};

/** Imperative API used by the hero scroll animation. */
export type KeyboardHandle = {
    /** Keycap meshes with the X coordinate of their visual center in the keyboard frame. */
    getKeycaps: () => { mesh: THREE.Mesh; x: number }[];
    /** X coordinate of every switch in the keyboard frame, index-aligned with `setSwitchLifts`. */
    getSwitchXs: () => number[];
    /** Raises the switch `i` by `lifts[i].y` above its rest height. */
    setSwitchLifts: (lifts: readonly { y: number }[]) => void;
};

type KeyboardProps = React.ComponentProps<'group'> & {
    ref?: React.Ref<KeyboardHandle>;
    keycapMaterial?: THREE.Material;
    knobColor?: string;
};

/** NOTE Offset of the instance translation (`tx, ty`) inside a column-major 4×4 matrix. */
const MATRIX_TX = 12;
const MATRIX_TY = 13;

function useKeyboardMaterials(knobColor: string) {
    const [keycapTexture, knurlTexture, screenTexture] = useTexture([
        DEFAULT_KEYCAP_TEXTURE.path,
        '/Knurl.jpg',
        '/screen_uv.png',
    ]);

    const materials = useMemo(() => {
        keycapTexture.flipY = false;
        keycapTexture.colorSpace = THREE.SRGBColorSpace;

        knurlTexture.flipY = false;
        knurlTexture.repeat.set(6, 6);
        knurlTexture.wrapS = THREE.RepeatWrapping;
        knurlTexture.wrapT = THREE.RepeatWrapping;

        screenTexture.flipY = false;
        screenTexture.repeat.set(-1, -1);
        screenTexture.offset.set(1, 1);

        return {
            keycap: new THREE.MeshStandardMaterial({ map: keycapTexture, roughness: 0.7 }),
            plate: new THREE.MeshStandardMaterial({ color: '#888888', roughness: 0.4 }),
            bottomCase: new THREE.MeshStandardMaterial({ color: '#1e548a', roughness: 0.4 }),
            topCase: new THREE.MeshStandardMaterial({ color: '#dddddd', roughness: 0.7 }),
            screen: new THREE.MeshStandardMaterial({ map: screenTexture, roughness: 0.4 }),
            feet: new THREE.MeshStandardMaterial({ color: '#333333', roughness: 0.6 }),
            switchHousing: new THREE.MeshStandardMaterial({ color: '#cccccc', roughness: 0.4 }),
            switchStem: new THREE.MeshStandardMaterial({ color: '#bb2222', roughness: 0.4 }),
            switchContacts: new THREE.MeshStandardMaterial({ color: '#FFCF5F', roughness: 0.1, metalness: 1 }),
        };
    }, [keycapTexture, knurlTexture, screenTexture]);

    const knob = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: knobColor,
                roughness: 0.4,
                metalness: 1,
                bumpMap: knurlTexture,
                bumpScale: 0.8,
            }),
        [knobColor, knurlTexture],
    );

    useEffect(() => () => Object.values(materials).forEach((material) => material.dispose()), [materials]);
    useEffect(() => () => knob.dispose(), [knob]);

    return { ...materials, knob };
}

export function Keyboard({
    ref,
    keycapMaterial,
    knobColor = DEFAULT_KEYCAP_TEXTURE.knobColor,
    ...props
}: KeyboardProps) {
    // NOTE Node and material names come from the GLTF file, so the loader cannot type them.
    const { nodes, materials } = useGLTF(MODEL_PATH, DRACO_DECODER_PATH) as unknown as GLTFResult;
    const ownMaterials = useKeyboardMaterials(knobColor);
    const keycapMat = keycapMaterial ?? ownMaterials.keycap;

    const keycapRefs = useRef(new Map<KeycapNode, THREE.Mesh>());

    // NOTE All four switch parts share one instance matrix buffer, so a single upload moves every part.
    const switchMatrix = useMemo(() => {
        const source = nodes.Switch_Heavy002.instanceMatrix;
        const matrix = new THREE.InstancedBufferAttribute(Float32Array.from(source.array), source.itemSize);
        matrix.setUsage(THREE.DynamicDrawUsage);
        return matrix;
    }, [nodes]);
    const switchRestY = useMemo(
        () => Float32Array.from({ length: switchMatrix.count }, (_, i) => switchMatrix.array[i * 16 + MATRIX_TY]),
        [switchMatrix],
    );

    useImperativeHandle(
        ref,
        () => ({
            getKeycaps: () =>
                Array.from(keycapRefs.current.values(), (mesh) => {
                    const { geometry } = mesh;
                    if (!geometry.boundingBox) geometry.computeBoundingBox();
                    const box = geometry.boundingBox ?? new THREE.Box3();
                    return { mesh, x: mesh.position.x + (box.min.x + box.max.x) / 2 };
                }),
            getSwitchXs: () =>
                Array.from(
                    { length: switchMatrix.count },
                    (_, i) => SWITCHES_ORIGIN[0] + switchMatrix.array[i * 16 + MATRIX_TX],
                ),
            setSwitchLifts: (lifts) => {
                const array = switchMatrix.array;
                for (let i = 0; i < switchRestY.length; i++) {
                    array[i * 16 + MATRIX_TY] = switchRestY[i] + (lifts[i]?.y ?? 0);
                }
                switchMatrix.needsUpdate = true;
            },
        }),
        [switchMatrix, switchRestY],
    );

    const switchParts = [
        { geometry: nodes.Switch_Heavy002.geometry, material: ownMaterials.switchHousing },
        { geometry: nodes.Switch_Heavy002_1.geometry, material: ownMaterials.switchContacts },
        { geometry: nodes.Switch_Heavy002_2.geometry, material: ownMaterials.switchStem },
        { geometry: nodes.Switch_Heavy002_3.geometry, material: ownMaterials.switchHousing },
    ];

    return (
        // NOTE Geometries belong to the shared useGLTF cache and must outlive this component.
        <group {...props} dispose={null}>
            <group position={[0.02, 0, 0]}>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Plate.geometry}
                    material={ownMaterials.plate}
                    position={[-0.022, -0.006, -0.057]}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Knob.geometry}
                    material={ownMaterials.knob}
                    position={[0.121, 0.004, -0.106]}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.PCB.geometry}
                    material={ownMaterials.plate}
                    position={[-0.022, -0.009, -0.057]}
                />

                {/* NOTE Switches sit under the keycaps, so they receive shadows but do not cast them. */}
                <group position={SWITCHES_ORIGIN}>
                    {switchParts.map(({ geometry, material }, index) => (
                        <instancedMesh
                            key={index}
                            args={[geometry, material, switchMatrix.count]}
                            instanceMatrix={switchMatrix}
                            receiveShadow
                        />
                    ))}
                </group>

                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes['625u_Wire001'].geometry}
                    material={materials.Gold}
                    position={[-0.043, -0.001, -0.014]}
                    rotation={[Math.PI, 0, Math.PI]}
                />
                <group position={[-0.022, -0.014, -0.057]}>
                    <mesh
                        castShadow
                        receiveShadow
                        geometry={nodes.Cube005.geometry}
                        material={ownMaterials.bottomCase}
                    />
                    <mesh castShadow receiveShadow geometry={nodes.Cube005_1.geometry} material={ownMaterials.feet} />
                </group>
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Top_Case.geometry}
                    material={ownMaterials.topCase}
                    position={[-0.022, -0.014, -0.057]}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Weight.geometry}
                    material={keycapMat}
                    position={[-0.022, -0.014, -0.057]}
                />
                <mesh
                    castShadow
                    receiveShadow
                    geometry={nodes.Screen.geometry}
                    material={ownMaterials.screen}
                    position={[0.092, 0.001, -0.106]}
                    scale={-1}
                />

                {KEYCAP_LAYOUT.map(({ node, position }) => (
                    <mesh
                        key={node}
                        ref={(mesh) => {
                            if (mesh) keycapRefs.current.set(node, mesh);
                            else keycapRefs.current.delete(node);
                        }}
                        castShadow
                        receiveShadow
                        geometry={nodes[node].geometry}
                        material={keycapMat}
                        position={position}
                    />
                ))}

                <instancedMesh
                    args={[nodes['2U_Wires'].geometry, materials.Gold, 3]}
                    castShadow
                    receiveShadow
                    instanceMatrix={nodes['2U_Wires'].instanceMatrix}
                    position={[0.092, 0.009, -0.086]}
                />
                <instancedMesh
                    args={[nodes.Stab_Housing_Instances.geometry, materials.Stem, 8]}
                    castShadow
                    receiveShadow
                    instanceMatrix={nodes.Stab_Housing_Instances.instanceMatrix}
                    position={[0.08, -0.004, -0.085]}
                />
            </group>
        </group>
    );
}

useGLTF.preload(MODEL_PATH, DRACO_DECODER_PATH);
