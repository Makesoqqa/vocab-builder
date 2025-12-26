import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Vocab Builder - So'z boyligingizni oshiring",
    description: "Zamonaviy mobile ilova orqali ingliz tilida yangi so'zlarni o'rganing va so'z boyligingizni oshiring",
    icons: {
        icon: "/icon.svg",
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#f5f6f7" },
        { media: "(prefers-color-scheme: dark)", color: "#212529" },
    ],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="uz">
            <head>
                <Script
                    src="https://telegram.org/js/telegram-web-app.js"
                    strategy="beforeInteractive"
                />
            </head>
            <body className={`${inter.className} font-sans antialiased`}>
                {children}
                <Analytics />
            </body>
        </html>
    );
}
