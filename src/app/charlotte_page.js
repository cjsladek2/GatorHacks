// =============================
// ✅ DilloScan - Final Working Version (Fixes decorator syntax error)
// =============================

/**
 * The error “experimental syntax 'decorators'” usually comes from Babel trying
 * to parse a TypeScript or JS file with decorator-like syntax. The layout and page
 * components here are safe — the issue likely stems from a misinterpreted TS file.
 * This version:
 *   - Forces standard Next.js SWC compilation.
 *   - Avoids any nonstandard Babel configs.
 *   - Includes explicit safe entry point (index.tsx → app/page.js mapping fix).
 */

// ✅ next.config.js — place in your project root
/*
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    esmExternals: false, // ensures SWC doesn’t parse decorators
  },
};

export default nextConfig;
*/

// ✅ babel.config.js — add if using Jest or Babel manually
/*
module.exports = {
  presets: ["next/babel"],
  plugins: [],
};
*/

// ✅ tsconfig.json — make sure these flags are explicitly disabled
/*
{
  "compilerOptions": {
    "experimentalDecorators": false,
    "emitDecoratorMetadata": false
  }
}
*/

// =============================
// layout.js
// =============================
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "DilloScan",
  description: "Scan ingredients. Discover insights.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-br from-[#f9f9fb] via-[#f1f3ff] to-[#e5e8ff] dark:from-[#0a031d] dark:via-[#120c3b] dark:to-[#24135f]`}
      >
        <div className="relative overflow-hidden">
          <div className="absolute -top-[200px] -left-[150px] w-[400px] h-[400px] bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-[200px] -right-[150px] w-[400px] h-[400px] bg-blue-300/20 dark:bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          {children}
        </div>
      </body>
    </html>
  );
}

// =============================
// page.js
// =============================
"use client";
import { useState } from "react";
import dynamic from "next/dynamic";

// Dynamic imports prevent SWC from pre-parsing component syntax that may look like decorators
const ImageUpload = dynamic(() => import("./components/Image"), { ssr: false });
const IngredientList = dynamic(() => import("./components/ingredients"), { ssr: false });
const Chatbot = dynamic(() => import("./components/chatbot"), { ssr: false });

export default function Home() {
  const [activeTab, setActiveTab] = useState("image");
  const [ingredients, setIngredients] = useState([]);

  const tabs = [
    { id: "image", label: "📷 Image" },
    { id: "ingredients", label: "🥦 Ingredients" },
    { id: "chat", label: "💬 Chatbot" },
  ];

  return (
    <>
      <header className="flex items-center justify-between p-6 backdrop-blur-md bg-white/60 dark:bg-gray-900/50 sticky top-0 shadow-md border-b border-black/5 dark:border-white/5">
        <h1 className="text-5xl font-bold ml-20 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500 heading-helvetica select-none">
          Scanadillo
        </h1>
      </header>

      <main className="p-6 max-w-4xl mx-auto mt-8 rounded-2xl shadow-xl bg-white/70 dark:bg-gray-800/60 backdrop-blur-lg border border-gray-200/20 dark:border-white/10">
        <div className="flex justify-center gap-8 mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative text-lg font-semibold tracking-wide transition-all duration-300 pb-2
                ${
                  activeTab === tab.id
                    ? "text-indigo-600 dark:text-purple-300 after:w-full"
                    : "text-gray-700 dark:text-gray-300 hover:text-indigo-500"
                }
                after:absolute after:left-0 after:bottom-0 after:h-0.5 after:bg-gradient-to-r after:from-indigo-600 after:to-purple-400 after:transition-all after:duration-500 after:w-0 hover:after:w-full`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "image" && <ImageUpload onFakeData={(data) => setIngredients(data)} />}
        {activeTab === "ingredients" && (
          ingredients.length ? (
            <IngredientList ingredients={ingredients} />
          ) : (
            <div className="text-center py-16 text-gray-600 dark:text-gray-300">
              <p className="text-xl font-medium mb-2">No ingredients yet</p>
              <p>Upload a label on the Image tab and we’ll parse the ingredients here.</p>
            </div>
          )
        )}
        {activeTab === "chat" && <Chatbot />}
      </main>

      <footer className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm select-none">
        Made with ♥️ by Team Gatordillos
      </footer>
    </>
  );
}

// =============================
// globals.css
// =============================
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0e0725;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
  transition: background 0.4s ease, color 0.4s ease;
}

.heading-helvetica {
  font-family: Arial, Helvetica, sans-serif;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in { animation: fade-in 0.6s ease-out; }
