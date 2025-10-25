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

  // Start camera - sets state to show video element
  const startCamera = () => {
    setCameraActive(true);
  };

  // This runs AFTER the video element is rendered
  useEffect(() => {
    if (cameraActive && videoRef.current && !streamRef.current) {
      initializeCamera();
    }
  }, [cameraActive]);

  // Actually initialize the camera stream
  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Wait for metadata to load
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
            .then(() => {
              setVideoReady(true);
            })
            .catch(err => {
              console.error("Play error:", err);
              alert("Could not play video: " + err.message);
            });
        };
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setVideoReady(false);
  };

  // Take snapshot
  const takePhoto = () => {
    if (!videoRef.current || !videoReady) {
      alert("Video not ready yet, try again.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);

    const imageData = canvas.toDataURL("image/png");
    setSelectedImage(imageData); 

    localStorage.setItem("uploadedImage", imageData);

    // Simulated OCR/fake ingredient data
    const fakeIngredients = ["Sugar", "Palm Oil", "Whey Protein", "Vitamin D"];
    if (onFakeData) onFakeData(fakeIngredients);

    stopCamera();
  };

  const cancelCamera = () => {
    stopCamera();
  };
  
  useEffect(() => {
    const savedImage = localStorage.getItem("uploadedImage");
    if (savedImage) {
      setSelectedImage(savedImage);
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  function handleImageChange(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const imageData = e.target.result;
        setSelectedImage(imageData);

        localStorage.setItem("uploadedImage", imageData);

        // Simulated OCR/fake ingredient data
        const fakeIngredients = ["Sugar", "Palm Oil", "Whey Protein", "Vitamin D"];
        if (onFakeData) onFakeData(fakeIngredients);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleUploadNew() {
    setSelectedImage(null);
    localStorage.removeItem("uploadedImage");
  }
  
  function parseIngredientsFromText(text) {
    const lower = text.toLowerCase();
    const startIdx = 0;//lower.indexOf("ingredients");
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
	  console.log(text);
      const list = parseIngredientsFromText(text);
	  console.log(list);
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

      {/* Box around file input */}
      {!selectedImage && !cameraActive && (
        <div className="flex flex-col space-y-4">
          <label className="w-64 h-32 border-2 border-dashed border-gray-400 rounded flex items-center justify-center cursor-pointer hover:border-gray-600 transition">
            <span className="text-gray-500">Click to choose file</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>

          {/* Take photo button */}
          <button
            onClick={startCamera}
            className="w-64 h-12 border-2 border-dashed border-gray-400 rounded flex items-center justify-center hover:border-gray-600 transition"
          >
            Take a Photo
          </button>
        </div>
      )}

      {/* Camera preview */}
      {cameraActive && (
        <div className="flex flex-col items-center space-y-4 w-full max-w-2xl">
          <div className="relative w-full">
            <video 
              ref={videoRef} 
              className="w-full h-96 border rounded bg-black object-cover" 
              autoPlay 
              playsInline
              muted
            />
            {!videoReady && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white text-lg">Loading camera...</p>
              </div>
            )}
          </div>
          <div className="flex space-x-4">
            <button
              onClick={takePhoto}
              disabled={!videoReady}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Capture Photo
            </button>
            <button
              onClick={cancelCamera}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Preview + new upload button */}
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