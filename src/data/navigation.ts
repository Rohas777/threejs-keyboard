export type SectionLink = {
    href: `#${string}`;
    title: string;
    description: string;
};

/** In-page anchors of the landing sections, shared by the menu and the footer. */
export const SECTION_LINKS: readonly SectionLink[] = [
    { href: '#features', title: 'Features', description: 'Learn more about our features' },
    { href: '#switch-playground', title: 'Switch Playground', description: 'Choose your perfect switch' },
    { href: '#keycap-changer', title: 'Keycaps', description: 'Choose your perfect keycap set' },
    { href: '#buy-button', title: 'Purchase', description: 'Order your Vapor75 now!' },
];
