import 'react';

declare module 'react' {
    /** Custom properties of the variable-font utilities in `globals.css`. */
    interface CSSProperties {
        '--wdth'?: number;
        '--wght'?: number;
    }
}
