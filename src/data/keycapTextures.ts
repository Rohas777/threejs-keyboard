export type KeycapTexture = {
    id: string;
    name: string;
    path: string;
    knobColor: string;
};

/** Keycap sets available in the color changer; the first entry is the default look of the keyboard. */
export const KEYCAP_TEXTURES = [
    { id: 'goodwell', name: 'Goodwell', path: '/goodwell_uv.png', knobColor: '#E44E21' },
    { id: 'dreamboard', name: 'Dreamboard', path: '/dreamboard_uv.png', knobColor: '#E9759F' },
    { id: 'cherrynavy', name: 'Cherry Navy', path: '/cherrynavy_uv.png', knobColor: '#F06B7E' },
    { id: 'kick', name: 'Kick', path: '/kick_uv.png', knobColor: '#FD0A0A' },
    { id: 'oldschool', name: 'Old School', path: '/oldschool_uv.png', knobColor: '#B89D82' },
    { id: 'candykeys', name: 'Candy Keys', path: '/candykeys_uv.png', knobColor: '#F38785' },
] as const satisfies readonly KeycapTexture[];

export const DEFAULT_KEYCAP_TEXTURE: KeycapTexture = KEYCAP_TEXTURES[0];

/** Textures of the single floating keycaps in the hero scene. */
export const FLOATING_KEYCAP_TEXTURES = [
    '/keycap_uv-1.png',
    '/keycap_uv-2.png',
    '/keycap_uv-3.png',
    '/keycap_uv-4.png',
    '/keycap_uv-5.png',
    '/keycap_uv-6.png',
    '/keycap_uv-7.png',
    '/keycap_uv-8.png',
    '/keycap_uv-9.png',
] as const;

export type FloatingKeycapTexture = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
