export type SwitchColor = 'red' | 'brown' | 'blue' | 'black';

export type SwitchItem = {
    color: SwitchColor;
    name: string;
    hexColor: string;
    sounds: readonly string[];
};

export const SWITCHES: readonly SwitchItem[] = [
    {
        color: 'red',
        name: 'Red Max',
        hexColor: '#C92627',
        sounds: ['/sounds/red-1.mp3', '/sounds/red-2.mp3', '/sounds/red-3.mp3'],
    },
    {
        color: 'brown',
        name: 'Brown Max',
        hexColor: '#6E3205',
        sounds: ['/sounds/brown-1.mp3', '/sounds/brown-2.mp3', '/sounds/brown-3.mp3'],
    },
    {
        color: 'blue',
        name: 'Blue Max',
        hexColor: '#0F80E7',
        sounds: ['/sounds/blue-1.mp3', '/sounds/blue-2.mp3', '/sounds/blue-3.mp3'],
    },
    {
        color: 'black',
        name: 'Black Max',
        hexColor: '#000000',
        sounds: ['/sounds/black-1.mp3', '/sounds/black-2.mp3', '/sounds/black-3.mp3'],
    },
];
