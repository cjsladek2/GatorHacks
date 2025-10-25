const express = require("express");
const multer = require("multer");
const Tesseract = require("tesseract.js");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Multer setup (store images in /uploads)
const upload = multer({ dest: "uploads/" });

// Serve a simple HTML upload form
app.get("/", (req, res) => {
  res.send(`
    <h2>Image to Text (OCR)</h2>
    <form action="/upload" method="post" enctype="multipart/form-data">
      <input type="file" name="image" accept="image/*" required />
      <button type="submit">Upload & Extract Text</button>
    </form>
  `);
});

// Handle file upload & OCR
app.post("/upload", upload.single("image"), async (req, res) => {
  app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const imagePath = path.resolve(req.file.path);

    console.log("Reading text from:", imagePath);

    // Read image file into a buffer
    const imageBuffer = fs.readFileSync(imagePath);

    // Perform OCR using buffer
    const result = await Tesseract.recognize(imageBuffer, "eng");

    // Delete uploaded image after processing
    fs.unlinkSync(imagePath);

    res.json({
      text: result.data.text.trim(),
    });
  } catch (error) {
    console.error("Error during OCR:", error);
    res.status(500).json({ error: "Failed to extract text", details: error.message });
  }
});

});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
