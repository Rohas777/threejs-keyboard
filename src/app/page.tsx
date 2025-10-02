import { BentoBox, ColorChanger, Hero, Marquee, PurchaseButton, Switches } from '@/sections';

export default function Home() {
    return (
        <main>
            <Hero />
            <BentoBox />
            <Marquee />
            <Switches />
            <Marquee direction="right" />
            <ColorChanger />
            <Marquee />
            <PurchaseButton />
        </main>
    );
}

