"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const ImageUpload = dynamic(() => import("./components/Image"), { ssr: false });
const IngredientList = dynamic(() => import("./components/ingredients"), { ssr: false });
const Chatbot = dynamic(() => import("./components/chatbot"), { ssr: false });

export default function Home() {
  const [activeTab, setActiveTab] = useState("image");
  const [ingredients, setIngredients] = useState([]);

  const tabs = [
    { id: "image", label: "Image Scan" },
    { id: "ingredients", label: "Ingredients" },
    { id: "chat", label: "AI Chatbot" },
  ];

  return (
    <>
      {/* ================================
          Hero Section
      ================================ */}
      <section className="relative text-center py-36 sm:py-44 bg-gradient-to-b from-white via-[#f8faff] to-[#f0fff7] dark:from-[#0e0b20] dark:via-[#14142b] dark:to-[#1a1932] overflow-visible">
        {/* Background flare */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-150px] -translate-x-1/2 w-[900px] h-[900px] bg-gradient-to-tr from-indigo-200 via-blue-100 to-green-200 opacity-50 blur-3xl" />
        </div>

        <h2 className="text-6xl sm:text-7xl font-extrabold leading-[1.15] text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-500 to-green-500 animate-fade-in-up">
          Scan Ingredients. Discover Insights.
        </h2>

        <p className="mt-6 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg animate-fade-in-up">
          Upload a label or photo and let Scanadillo break down each ingredient into
          health and environmental insights — fast, accurate, and beautifully explained.
        </p>

        {/* Tabs */}
        <div className="mt-10 flex justify-center gap-4 flex-wrap animate-fade-in-up">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-7 py-3 rounded-full text-base font-semibold transition-all duration-500 relative ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-indigo-500 to-green-400 text-white shadow-md ring-pulse"
                  : "bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Decorative curve */}
        <div className="absolute bottom-0 left-0 w-full h-[150px] bg-gradient-to-b from-transparent to-white dark:to-[#0e0b20]" />
      </section>

      {/* ================================
          Main Content Area
      ================================ */}
      <section className="max-w-5xl mx-auto mt-20 mb-32 px-6" id="features">
        {/* If the tab is NOT chat, wrap it in the glass card */}
        {activeTab !== "chat" ? (
          <div className="glass p-10 rounded-3xl shadow-xl animate-fade-in-up">
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
          /* Chat tab stands alone — no outer glass container */
          <div id="chat" className="animate-fade-in-up mt-4">
            <Chatbot />
          </div>
        )}
      </section>
    </>
  );
}
