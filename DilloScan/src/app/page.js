"use client";
import { useState } from "react";
import ImageUpload from "./components/Image";
import IngredientList from "./components/ingredients";
import Chatbot from "./components/chatbot";

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
    {/* Heading at top-left of the page */}
      <header className="p-6">
        <h1 className="text-5xl font-bold ml-20 heading-helvetica">DilloScan</h1>
      </header>

    <main className="p-6 max-w-3xl mx-auto">

    
      {/* Tab Buttons */}
      <div className="flex justify-center space-x-6 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative pb-1 cursor-pointer text-gray-700 dark:text-gray-300
                        after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 
                        after:bg-blue-600 after:transition-all hover:after:w-full
                        ${activeTab === tab.id ? "after:w-full" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Render Tabs */}
      {activeTab === "image" && (
        <ImageUpload onFakeData={(data) => setIngredients(data)} />
      )}
      {activeTab === "ingredients" && <IngredientList ingredients={ingredients} />}
      {activeTab === "chat" && <Chatbot />}
    </main>
    </>
  );
}
