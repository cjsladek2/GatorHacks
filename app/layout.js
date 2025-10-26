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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        {/* Header */}
        <header className="fixed top-0 left-0 w-full z-40 bg-gradient-to-r from-indigo-50/80 via-white/80 to-green-50/80 dark:from-[#0e0b20]/80 dark:to-[#1b1930]/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto flex justify-between items-center px-10 py-4">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-green-600 select-none">
              Scanadillo
            </h1>
            <nav className="flex gap-8 text-sm font-medium text-gray-700 dark:text-gray-200">
              <a href="#features" className="hover:text-indigo-500">Features</a>
              <a href="#ingredients" className="hover:text-indigo-500">Ingredients</a>
              <a href="#chat" className="hover:text-indigo-500">Chatbot</a>
            </nav>
          </div>
        </header>

        <main className="flex-grow pt-24">{children}</main>

        <footer className="text-center py-10 text-gray-500 text-sm border-t border-gray-200 dark:border-gray-800">
          Made with care by <span className="text-indigo-500 font-semibold">Team Gatordillos</span>
        </footer>
      </body>
    </html>
  );
}
