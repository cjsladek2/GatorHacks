const T = require("tesseract.js");

// Define the image path and language for OCR
const imagePath = 'stop-sign1.jpg';
const language = 'eng';

// Define the logger function to track progress
function logProgress(event) {
    console.log(event);
  }

// Perform the OCR process
T.recognize(imagePath, language, { 
  logger: logProgress // Use the logger to track progress
})
  .then((result) => {
    // Handle the successful OCR result
    console.log('OCR Result:', result.data.text);
  })
  .catch((error) => {
    // Handle any errors during the OCR process
    console.error('OCR Error:', error);
  });