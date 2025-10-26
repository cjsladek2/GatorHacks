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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Header */}
        <header className="fixed top-0 left-0 w-full z-50 bg-white/70 dark:bg-gray-900/60 backdrop-blur-md border-b border-gray-200/30 dark:border-white/10 flex justify-between items-center px-8 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <Image
              src="/armadillos/armadillo_standing.png"
              alt="Scanadillo logo"
              width={40}
              height={40}
              priority
              className="scale-x-[-1] transform"
            />
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-green-500 select-none">
              Scanadillo
            </h1>
          </div>

          {/* ✅ Replace nav with our client-side NavBar */}
          <NavBar />
        </header>

        {/* Offset for fixed header */}
        <main className="pt-24">{children}</main>
      </body>
    </html>
  );
}
