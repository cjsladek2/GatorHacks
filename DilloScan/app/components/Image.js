"use client";
import { useState, useEffect, useRef } from "react";

export default function ImageUpload({ onIngredientsAnalyzed }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = () => setCameraActive(true);

  useEffect(() => {
    if (cameraActive && videoRef.current && !streamRef.current) {
      initializeCamera();
    }
  }, [cameraActive]);

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current
            .play()
            .then(() => setVideoReady(true))
            .catch((err) => {
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
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
    setVideoReady(false);
  };

  const analyzeImage = async (imageData) => {
    setAnalyzing(true);
    try {
      const response = await fetch("http://localhost:5000/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData }),
      });
      const result = await response.json();
      if (result.success) onIngredientsAnalyzed(result);
      else alert("Error analyzing image: " + result.error);
    } catch (error) {
      console.error("API Error:", error);
      alert("Could not connect to analysis server. Make sure the Python API is running on port 5000.");
    } finally {
      setAnalyzing(false);
    }
  };

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
    stopCamera();
    analyzeImage(imageData);
  };

  const cancelCamera = () => stopCamera();

  useEffect(() => {
    const savedImage = localStorage.getItem("uploadedImage");
    if (savedImage) setSelectedImage(savedImage);
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
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
        analyzeImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleUploadNew() {
    setSelectedImage(null);
    localStorage.removeItem("uploadedImage");
    onIngredientsAnalyzed(null);
  }

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-semibold mb-4">Upload Nutrition Label</h2>

  {/* ===============================
      Reversed Button Order + Sizes
  =============================== */}
  {!selectedImage && !cameraActive && (
    <div className="flex flex-col space-y-4">
      {/* Large square "Take a Photo" */}
      <button
        onClick={startCamera}
        className="w-64 h-32 border-2 border-dashed border-gray-400 rounded flex items-center justify-center
                   text-gray-500 text-lg font-medium hover:border-indigo-400 hover:bg-indigo-50
                   dark:hover:bg-indigo-950 transition-all"
      >
        📸 Take a Photo
      </button>

      {/* Smaller rectangle "Choose File" */}
      <label
        className="w-64 h-12 border-2 border-dashed border-gray-400 rounded flex items-center justify-center
                   cursor-pointer text-gray-500 text-lg font-medium hover:border-indigo-400 hover:bg-indigo-50
                   dark:hover:bg-indigo-950 transition-all"
      >
        📁 Choose File
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
      </label>
    </div>
  )}

      {/* ===============================
          Camera preview
      =============================== */}
      {cameraActive && (
        <div className="flex flex-col items-center space-y-4 w-full max-w-2xl">
          <div className="relative w-full">
            <video
              ref={videoRef}
              className="w-full h-96 border-2 border-indigo-200 rounded-lg bg-black object-cover shadow-lg"
              autoPlay
              playsInline
              muted
            />
            {!videoReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-900/50 to-blue-900/50 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-3"></div>
                  <p className="text-white text-lg font-medium">Loading camera...</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex space-x-4">
            <button
              onClick={takePhoto}
              disabled={!videoReady}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              📷 Capture Photo
            </button>
            <button
              onClick={cancelCamera}
              className="px-6 py-3 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-all font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ===============================
          Preview + Re-upload
      =============================== */}
      {selectedImage && (
        <div className="flex flex-col items-center">
          <img
            src={selectedImage}
            alt="Selected nutrition label"
            className="max-w-md border-2 border-indigo-200 rounded-lg shadow-lg p-2 mt-2"
          />

          {analyzing && (
            <div className="mt-6 flex flex-col items-center space-y-3">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  Analyzing ingredients...
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Using AI to extract and analyze nutrition data
              </p>
            </div>
          )}

          {!analyzing && (
            <button
              onClick={handleUploadNew}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-indigo-500 to-green-400 text-white rounded-full hover:shadow-md transition-all font-semibold"
            >
              Upload New Image
            </button>
          )}
        </div>
      )}
    </div>
  );
}
