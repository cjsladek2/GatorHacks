"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";

const ImageUpload = dynamic(() => import("./components/Image"), { ssr: false });
const IngredientList = dynamic(() => import("./components/ingredients"), { ssr: false });
const Chatbot = dynamic(() => import("./components/chatbot"), { ssr: false });

export default function Home() {
  const [activeTab, setActiveTab] = useState("image");
  const [ingredients, setIngredients] = useState([]);

  const tabs = [
    { id: "image", label: "Scan Label" },
    { id: "ingredients", label: "Your Ingredients" },
    { id: "chat", label: "Health Chat" },
  ];

  return (
    <>
      {/* Hero Section */}
      <section
        className="relative z-0 text-center py-20 sm:py-20
        bg-gradient-to-b from-white via-[#f8faff] to-[#f0fff7]
        dark:from-[#0e0b20] dark:via-[#14142b] dark:to-[#1a1932]
        overflow-visible"
      >
        {/* ✅ Soft white overlay for bright, solid banner */}
        <div className="absolute inset-0 bg-white/95 -z-20" />

        {/* Background flare */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div
            className="absolute left-1/2 top-[-150px] -translate-x-1/2 w-[900px] h-[900px]
            bg-gradient-to-tr from-indigo-100 via-blue-50 to-green-100 opacity-70 blur-[120px]"
          />
        </div>

        {/* Heading */}
        <h2
          className="text-6xl sm:text-7xl font-extrabold leading-[1.15]
          text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-500 to-green-500
          animate-fade-in-up"
        >
          Scan Ingredients. Discover Insights.
        </h2>

        <p
          className="mt-6 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg
          animate-fade-in-up"
        >
          Upload a label or photo and let Scanadillo break down each ingredient into health and
          environmental insights — fast, accurate, and beautifully explained.
        </p>

        {/* Tabs */}
        <div className="mt-10 flex justify-center gap-4 flex-wrap animate-fade-in-up relative z-20">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-7 py-3 rounded-full text-base font-semibold transition-all duration-300 transform ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-indigo-500 to-green-400 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  : "bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:shadow-md hover:-translate-y-0.5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Decorative bottom gradient */}
        <div
          className="absolute bottom-0 left-0 w-full h-[150px]
          bg-gradient-to-b from-transparent to-white dark:to-[#0e0b20] -z-10 pointer-events-none"
        />

        {/* Hero Armadillo */}
        <div
          className="absolute bottom-[-20px] right-20 w-[180px] md:w-[220px]
          opacity-95 select-none pointer-events-none"
        >
          <Image
            src="/armadillos/armadillo_laying.png"
            alt="Resting armadillo mascot"
            width={220}
            height={120}
          />
        </div>
      </section>

      {/* Main Content */}
      <section className="relative max-w-5xl mx-auto mt-20 mb-32 px-6" id="features">
        {activeTab !== "chat" ? (
          <div className="glass p-10 rounded-3xl shadow-xl animate-fade-in-up relative overflow-hidden">
            {activeTab === "image" && (
              <div>
                <h3 className="text-2xl font-bold mb-6 text-indigo-600">Image Scanner</h3>
                <ImageUpload onFakeData={(data) => setIngredients(data)} />
              </div>
            )}

            {activeTab === "ingredients" && (
              <div id="ingredients">
                <h3 className="text-2xl font-bold mb-6 text-indigo-600">Ingredients Overview</h3>
                {ingredients.length ? (
                  <IngredientList ingredients={ingredients} />
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    No ingredients detected yet. Upload an image to begin.
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          // Chat mode — no outer box
          <div id="chat" className="animate-fade-in-up">
            <Chatbot />
          </div>
        )}
      </section>

      {/* Footer */}
      <footer
        className="relative w-full border-t border-gray-200 dark:border-gray-800
        bg-white/60 dark:bg-gray-900/50 backdrop-blur-md py-6 mt-20"
      >
        <div className="max-w-5xl mx-auto flex justify-center items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Made with care by{" "}
            <span
              className="font-semibold text-transparent bg-clip-text
              bg-gradient-to-r from-indigo-500 to-green-500"
            >
              Team Gatordillos
            </span>
          </p>
        </div>

        {/* Footer Armadillo (bottom-right corner) */}
        <div
          className="absolute bottom-0 right-6 md:right-10 w-[140px]
          opacity-95 select-none pointer-events-none"
        >
          <Image
            src="/armadillos/armadillo_sitting.png"
            alt="Footer armadillo mascot"
            width={140}
            height={140}
          />
        </div>
      </footer>
    </>
  );
}
