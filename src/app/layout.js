// layout.js
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="fixed top-0 left-0 w-full z-50 bg-white/60 dark:bg-gray-900/50 backdrop-blur-md border-b border-white/10 flex justify-between items-center px-8 py-3">
          <div className="flex items-center gap-3">
            <Image
              src="/armadillos/armadillo_standing.png"
              alt="Scanadillo logo"
              width={40}
              height={40}
              priority
              className="scale-x-[-1] transform"
             />

            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-green-500">
              Scanadillo
            </h1>
          </div>

          <nav className="flex gap-6 text-gray-700 dark:text-gray-300 font-medium">
            <a href="#features" className="hover:text-indigo-500 transition">Features</a>
            <a href="#ingredients" className="hover:text-indigo-500 transition">Ingredients</a>
            <a href="#chat" className="hover:text-indigo-500 transition">Chatbot</a>
          </nav>
        </header>

        <main className="pt-24">{children}</main>
      </body>
    </html>
  );
}
