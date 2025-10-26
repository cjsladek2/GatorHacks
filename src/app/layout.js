<<<<<<< HEAD
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "./components/NavBar";
=======
// layout.js
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
>>>>>>> 6cf88da5875d8b154fdac5697c013ef5c8ea5e24

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
<<<<<<< HEAD
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Header */}
        <header className="fixed top-0 left-0 w-full z-50 bg-white/70 dark:bg-gray-900/60 backdrop-blur-md border-b border-gray-200/30 dark:border-white/10 flex justify-between items-center px-8 py-3 shadow-sm">
=======
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="fixed top-0 left-0 w-full z-50 bg-white/60 dark:bg-gray-900/50 backdrop-blur-md border-b border-white/10 flex justify-between items-center px-8 py-3">
>>>>>>> 6cf88da5875d8b154fdac5697c013ef5c8ea5e24
          <div className="flex items-center gap-3">
            <Image
              src="/armadillos/armadillo_standing.png"
              alt="Scanadillo logo"
              width={40}
              height={40}
              priority
              className="scale-x-[-1] transform"
<<<<<<< HEAD
            />
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-green-500 select-none">
=======
             />

            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-green-500">
>>>>>>> 6cf88da5875d8b154fdac5697c013ef5c8ea5e24
              Scanadillo
            </h1>
          </div>

<<<<<<< HEAD
          {/* ✅ Replace nav with our client-side NavBar */}
          <NavBar />
        </header>

        {/* Offset for fixed header */}
=======
          <nav className="flex gap-6 text-gray-700 dark:text-gray-300 font-medium">
            <a href="#features" className="hover:text-indigo-500 transition">Features</a>
            <a href="#ingredients" className="hover:text-indigo-500 transition">Ingredients</a>
            <a href="#chat" className="hover:text-indigo-500 transition">Chatbot</a>
          </nav>
        </header>

>>>>>>> 6cf88da5875d8b154fdac5697c013ef5c8ea5e24
        <main className="pt-24">{children}</main>
      </body>
    </html>
  );
}
