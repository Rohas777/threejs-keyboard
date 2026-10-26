import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import type { Metadata } from 'next';
import { Roboto_Flex } from 'next/font/google';
import './globals.css';

const robotoFlex = Roboto_Flex({
    variable: '--font-roboto-flex',
    subsets: ['latin'],
    display: 'swap',
    axes: ['wdth', 'slnt', 'opsz'],
});

export const metadata: Metadata = {
    title: 'Nimbus Keyboards',
    description: '3D keyboards landing page',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={robotoFlex.variable} data-scroll-locked="">
            <body className="antialiased">
                <Navbar />
                {children}
                <Footer />
            </body>
        </html>
    );
}
