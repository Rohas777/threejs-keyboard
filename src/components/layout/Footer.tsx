import { Logo } from '@/components/ui/Logo';
import { SECTION_LINKS } from '@/data/navigation';
import Link from 'next/link';
import { Bounded } from './Bounded';
import { CurrentYear } from './CurrentYear';

export function Footer() {
    return (
        <Bounded as="footer" className="bg-black text-gray-400">
            <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
                <div className="flex flex-col items-center md:items-start">
                    <Link href="/" className="shrink-0">
                        <Logo className="h-8 w-auto" />
                        <span className="sr-only">Nimbus home</span>
                    </Link>
                    <p className="mt-4 text-center text-sm md:text-left">
                        © <CurrentYear /> Nimbus Keyboards. All rights reserved.
                    </p>
                </div>
                <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 md:justify-end">
                    {SECTION_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm transition-colors hover:text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                        >
                            {link.title}
                        </Link>
                    ))}
                </nav>
            </div>
        </Bounded>
    );
}
