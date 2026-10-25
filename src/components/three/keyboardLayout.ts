type Vec3 = [number, number, number];

/** Keycap meshes of `keyboard.gltf`; each geometry already contains the key's offset along its row. */
export const KEYCAP_NODES = [
    'K_ESC',
    'K_F1',
    'K_F2',
    'K_F3',
    'K_F4',
    'K_F5',
    'K_F6',
    'K_F7',
    'K_F8',
    'K_F9',
    'K_F10',
    'K_F11',
    'K_F12',
    'K_DEL',
    'K_GRAVE',
    'K_1',
    'K_2',
    'K_3',
    'K_4',
    'K_5',
    'K_6',
    'K_7',
    'K_8',
    'K_9',
    'K_0',
    'K_DASH',
    'K_EQUAL',
    'K_BACKSPACE',
    'K_TAB',
    'K_Q',
    'K_W',
    'K_E',
    'K_R',
    'K_T',
    'K_Y',
    'K_U',
    'K_I',
    'K_O',
    'K_P',
    'K_LSQUAREBRACKET',
    'K_RSQUAREBRACKET',
    'K_BACKSLASH',
    'K_PAGEUP',
    'K_CAPS',
    'K_A',
    'K_S',
    'K_D',
    'K_F',
    'K_G',
    'K_H',
    'K_J',
    'K_K',
    'K_L',
    'K_SEMICOLON',
    'K_QUOTE',
    'K_ENTER',
    'K_PAGEDOWN',
    'K_LSHIFT',
    'K_Z',
    'K_X',
    'K_C',
    'K_V',
    'K_B',
    'K_N',
    'K_M',
    'K_COMMA',
    'K_PERIOD',
    'K_SLASH',
    'K_RSHIFT',
    'K_ARROWUP',
    'K_END',
    'K_LCONTROL',
    'K_LWIN',
    'K_LALT',
    'K_SPACE',
    'K_RALT',
    'K_FN',
    'K_ARROWLEFT',
    'K_ARROWDOWN',
    'K_ARROWRIGHT',
] as const;

export type KeycapNode = (typeof KEYCAP_NODES)[number];

const ROW_ORIGINS = {
    function: [-0.051, 0.01, -0.106],
    number: [-0.165, 0.01, -0.087],
    top: [-0.136, 0.008, -0.068],
    home: [-0.132, 0.007, -0.049],
    bottom: [-0.122, 0.008, -0.03],
    modifiers: [-0.162, 0.008, -0.011],
    arrows: [0.083, 0.008, -0.011],
} as const satisfies Record<string, Vec3>;

/** Mesh origins of keycaps that do not share their row origin. */
const KEYCAP_ORIGIN_OVERRIDES: Partial<Record<KeycapNode, Vec3>> = {
    K_DEL: [-0.165, 0.01, -0.087],
    K_BACKSPACE: [0.092, 0, -0.087],
    K_TAB: [-0.16, 0.008, -0.068],
    K_BACKSLASH: [-0.16, 0.008, -0.068],
    K_CAPS: [-0.158, 0, -0.049],
    K_ENTER: [0.09, 0, -0.049],
    K_LSHIFT: [-0.153, 0, -0.03],
    K_RSHIFT: [0.076, 0, -0.03],
    K_SPACE: [-0.043, 0, -0.01],
};

function rowOf(node: KeycapNode): keyof typeof ROW_ORIGINS {
    const index = KEYCAP_NODES.indexOf(node);
    if (index < KEYCAP_NODES.indexOf('K_GRAVE')) return 'function';
    if (index < KEYCAP_NODES.indexOf('K_TAB')) return 'number';
    if (index < KEYCAP_NODES.indexOf('K_CAPS')) return 'top';
    if (index < KEYCAP_NODES.indexOf('K_LSHIFT')) return 'home';
    if (index < KEYCAP_NODES.indexOf('K_LCONTROL')) return 'bottom';
    if (index < KEYCAP_NODES.indexOf('K_ARROWLEFT')) return 'modifiers';
    return 'arrows';
}

export type KeycapPlacement = { node: KeycapNode; position: Vec3 };

export const KEYCAP_LAYOUT: readonly KeycapPlacement[] = KEYCAP_NODES.map((node) => ({
    node,
    position: KEYCAP_ORIGIN_OVERRIDES[node] ?? [...ROW_ORIGINS[rowOf(node)]],
}));

/**
 * Origin of the switch instances (`Switches Positions` node of `keyboard.gltf`).
 * NOTE Y is 0.0019 lower than in the file so the switch tops stay hidden under the keycaps.
 */
export const SWITCHES_ORIGIN: Vec3 = [-0.16487, 0.00516, -0.1057];
