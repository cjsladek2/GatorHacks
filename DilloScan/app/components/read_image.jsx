"use client"
import { useState, useEffect, useRef } from "react";
import Tesseract from "tesseract.js";

export default function ImageUpload({ onFakeData }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [ingredients, setIngredients] = useState([]);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // ... your existing camera code, takePhoto, handleImageChange, etc. ...

  function parseIngredientsFromText(text) {
    const lower = text.toLowerCase();
    const startIdx = lower.indexOf("ingredients");
    if (startIdx === -1) return [];
    const tail = text.slice(startIdx);
    const colonIdx = tail.indexOf(":");
    const endBreakIdx = tail.indexOf("\n");
    const section = tail.slice(
      colonIdx > -1 ? colonIdx + 1 : 0,
      endBreakIdx > -1 ? endBreakIdx : tail.length
    );
    return section
      .split(/[;,]/)
      .map(s => s.replace(/\([^)]*\)/g, "").trim())
      .filter(Boolean)
      .map(s => s.replace(/\s+/g, " "));
  }

  async function checkIngredients() {
    if (!selectedImage) return;
    setIsChecking(true);
    try {
      const { data: { text } } = await Tesseract.recognize(selectedImage, "eng", {
        logger: m => console.log(m) // optional: progress logs
      });
      const list = parseIngredientsFromText(text);
      setIngredients(list);
      if (onFakeData) onFakeData(list); // reuse your callback with real data
    } catch (err) {
      console.error("OCR error:", err);
      alert("Failed to read text from image.");
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-semibold mb-4">Upload Nutrition Label</h2>

      {/* ... your existing upload/camera UI ... */}

      {selectedImage && (
        <div className="flex flex-col items-center">
          <img
            src={selectedImage}
            alt="Selected nutrition label"
            className="max-w-md border rounded p-2 mt-2"
          />
          <div className="flex space-x-4 mt-4">
            <button
              onClick={checkIngredients}
              disabled={isChecking}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isChecking ? "Scanning..." : "Check Ingredients"}
            </button>
            <button
              onClick={handleUploadNew}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Upload New Image
            </button>
          </div>

          {ingredients.length > 0 && (
            <div className="mt-4">
              <p className="font-medium">Detected ingredients:</p>
              <p>{ingredients.join(", ")}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}