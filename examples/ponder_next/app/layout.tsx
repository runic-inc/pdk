import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ClientLayout from "./ClientLayout";
import "./globals.css";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Create Patchwork",
    description: "Patchwork App created with create-patchwork",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const apiUrl = process.env.API_URL ?? '';
    return (
        <html lang="en">
            <body className={inter.className}>
                <ClientLayout apiUrl={apiUrl}>
                    {children}
                </ClientLayout>
            </body>
        </html>
    );
}
