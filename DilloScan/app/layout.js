import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "./components/NavBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Scanadillo",
  description: "Scan ingredients. Discover insights.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        {/* Header */}
        <header className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-indigo-50/80 via-white/80 to-green-50/80 dark:from-[#0e0b20]/80 dark:to-[#1b1930]/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto flex justify-between items-center px-10 py-4">
            {/* Logo + Title */}
            <div className="flex items-center gap-3">
              <Image
                src="/armadillos/armadillo_standing.png"
                alt="Scanadillo logo"
                width={40}
                height={40}
                priority
                className="scale-x-[-1] transform"
              />
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-green-600 select-none">
                Scanadillo
              </h1>
            </div>

            {/* Navigation */}
            <NavBar />
          </div>
        </header>

        {/* Main content offset for fixed header */}
        <main className="flex-grow pt-24">{children}</main>

      </body>
    </html>
  );
}
