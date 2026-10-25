import { describe, expect, it } from 'vitest';
import { KEYCAP_LAYOUT, KEYCAP_NODES } from './keyboardLayout';

describe('KEYCAP_LAYOUT', () => {
    it('places every keycap node exactly once', () => {
        expect(KEYCAP_LAYOUT).toHaveLength(80);
        expect(new Set(KEYCAP_LAYOUT.map(({ node }) => node))).toEqual(new Set(KEYCAP_NODES));
    });

    it('uses row origins for regular keys and overrides for wide keys', () => {
        const positionOf = (node: string) => KEYCAP_LAYOUT.find((placement) => placement.node === node)?.position;

        expect(positionOf('K_F5')).toEqual([-0.051, 0.01, -0.106]);
        expect(positionOf('K_DEL')).toEqual([-0.165, 0.01, -0.087]);
        expect(positionOf('K_ARROWUP')).toEqual([-0.122, 0.008, -0.03]);
        expect(positionOf('K_SPACE')).toEqual([-0.043, 0, -0.01]);
        expect(positionOf('K_ARROWRIGHT')).toEqual([0.083, 0.008, -0.011]);
    });

    it('gives each keycap its own position array', () => {
        const [first, second] = KEYCAP_LAYOUT;
        expect(first.position).not.toBe(second.position);
    });
});
