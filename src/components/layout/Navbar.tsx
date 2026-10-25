'use client';

import { Logo } from '@/components/ui/Logo';
import { SECTION_LINKS, SectionLink } from '@/data/navigation';
import { useCheckout } from '@/hooks/useCheckout';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
    DialogTrigger,
} from '@radix-ui/react-dialog';
import clsx from 'clsx';
import Link from 'next/link';
import { LuChevronRight, LuMenu, LuX } from 'react-icons/lu';

export function Navbar() {
    const { checkout, isPending } = useCheckout();

    return (
        <header className="fixed top-0 right-0 left-0 z-50 flex items-center justify-between p-3 md:p-6">
            <Link href="/" className="shrink-0 hover:scale-105 motion-safe:transition">
                <Logo className="h-6 w-auto md:h-8" />
                <span className="sr-only">Nimbus home</span>
            </Link>
            <div className="flex gap-3 md:gap-4">
                <button
                    onClick={checkout}
                    disabled={isPending}
                    className={clsx(
                        'group from-brand to-brand-dark hover:shadow-brand/25 focus:ring-brand relative flex h-12 transform-gpu cursor-pointer items-center justify-center overflow-hidden rounded bg-gradient-to-r px-6 py-2.5 font-semibold text-white will-change-transform hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:grayscale motion-safe:transition-all motion-safe:duration-300 md:text-base',
                        'before:absolute before:inset-0 before:translate-x-[-100%] before:bg-gradient-to-r before:from-white/0 before:via-white/20 before:to-white/0 before:ease-out hover:before:translate-x-[100%] motion-safe:before:transition-transform motion-safe:before:duration-700',
                    )}
                >
                    <span className="font-bold-slanted relative z-10 flex items-center gap-2 text-xl uppercase">
                        Buy
                        <LuChevronRight className="size-5 group-hover:translate-x-0.5 motion-safe:transition-transform motion-safe:duration-200" />
                    </span>
                </button>
                <Dialog>
                    <DialogTrigger className="flex size-12 cursor-pointer items-center justify-center rounded bg-gray-300 hover:bg-gray-300/80 hover:shadow-lg hover:shadow-black/10 motion-safe:transition">
                        <LuMenu className="size-5" />
                        <span className="sr-only">Toggle menu</span>
                    </DialogTrigger>
                    <DialogPortal>
                        <DialogOverlay className="motion-safe:data-[state=open]:animate-in motion-safe:data-[state=closed]:animate-out motion-safe:data-[state=closed]:fade-out-0 motion-safe:data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50" />
                        <DialogContent className="motion-safe:data-[state=open]:animate-in motion-safe:data-[state=closed]:animate-out motion-safe:data-[state=closed]:slide-out-to-right motion-safe:data-[state=open]:slide-in-from-right fixed inset-y-0 right-0 z-50 h-full w-3/4 bg-white p-4 shadow-lg ease-in-out motion-safe:transition motion-safe:data-[state=closed]:duration-300 motion-safe:data-[state=open]:duration-500 sm:max-w-sm">
                            <DialogTitle className="sr-only">Navigation</DialogTitle>
                            <DialogDescription className="sr-only">Jump to a section of the page</DialogDescription>
                            <DialogClose className="ml-auto flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-gray-400 hover:text-black motion-safe:transition">
                                <LuX className="size-5" />
                                <span className="sr-only">Close menu</span>
                            </DialogClose>
                            <nav>
                                <ul>
                                    {SECTION_LINKS.map((link) => (
                                        <NavbarLink key={link.href} link={link} />
                                    ))}
                                </ul>
                            </nav>
                        </DialogContent>
                    </DialogPortal>
                </Dialog>
            </div>
        </header>
    );
}

function NavbarLink({ link }: { link: SectionLink }) {
    return (
        <li>
            <DialogClose asChild>
                <Link
                    href={link.href}
                    className="group hover:bg-brand/10 flex items-center rounded-xl p-4 motion-safe:transition"
                >
                    <div className="flex grow flex-col gap-1">
                        <span className="group-hover:text-brand text-xl font-semibold text-gray-900 motion-safe:transition">
                            {link.title}
                        </span>
                        <span className="text-sm text-gray-500">{link.description}</span>
                    </div>
                    <div className="group-hover:bg-brand flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400 group-hover:text-white motion-safe:transition">
                        <LuChevronRight className="size-5 translate-x-px" />
                    </div>
                </Link>
            </DialogClose>
        </li>
    );
}
