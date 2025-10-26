from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import io
from PIL import Image
import pytesseract
import sys
import traceback
import os

print("=" * 50)
print("🚀 Starting API Server...")
print("=" * 50)

# Add parent directory to path to handle package imports
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

# Try to import the engine with error handling
try:
    print("📦 Importing IngredientEngine...")
    # Import as a package module
    from ingredx.engine import IngredientEngine
    print("✅ IngredientEngine imported successfully!")
except Exception as e:
    print(f"❌ ERROR importing IngredientEngine: {e}")
    traceback.print_exc()
    sys.exit(1)

app = Flask(__name__)
CORS(app)

# Initialize the engine with error handling
try:
    print("🔧 Initializing IngredientEngine...")
    engine = IngredientEngine()
    print("✅ IngredientEngine initialized successfully!")
except Exception as e:
    print(f"❌ ERROR initializing IngredientEngine: {e}")
    traceback.print_exc()
    sys.exit(1)


@app.route('/', methods=['GET'])
def home():
    """Health check endpoint"""
    return jsonify({
        'status': 'running',
        'message': 'DilloScan API is running!',
        'endpoints': ['/api/analyze-image', '/api/chat']
    })


@app.route('/api/analyze-image', methods=['POST'])
def analyze_image():
    """
    Accepts a base64 image, extracts text via OCR,
    then analyzes ingredients using IngredientEngine
    """
    try:
        print("\n" + "=" * 50)
        print("📸 Received image analysis request")
        
        data = request.json
        image_data = data.get('image')
        
        if not image_data:
            return jsonify({
                'success': False,
                'error': 'No image data provided'
            }), 400
        
        # Remove the data URL prefix if present
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        print("🔄 Decoding base64 image...")
        # Decode base64 to image
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        print(f"✅ Image decoded: {image.size}")
        
        # Preprocess image for better OCR
        print("🔧 Preprocessing image...")
        # Convert to grayscale
        image = image.convert('L')
        # Increase contrast
        from PIL import ImageEnhance
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(2.0)
        
        # Extract text using Tesseract OCR with optimized settings
        print("📝 Running OCR...")
        custom_config = r'--oem 3 --psm 6 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0-9,.()- '
        raw_text = pytesseract.image_to_string(image, config=custom_config)
        print(f"📄 Extracted text ({len(raw_text)} chars):")
        print(raw_text[:200] + "..." if len(raw_text) > 200 else raw_text)
        
        # Analyze ingredients using your engine
        print("🧪 Analyzing ingredients...")
        results = engine.analyze_ingredient_list(raw_text, language="en")
        
        # Post-process: Clean up common OCR typos in ingredient names
        if results.get('ingredients'):
            print("🔧 Cleaning up ingredient names...")
            cleaned_ingredients = []
            for ing in results['ingredients']:
                # Common OCR corrections
                cleaned = ing.replace('|', 'I').replace('0', 'O').replace('1', 'I')
                # Remove extra spaces
                cleaned = ' '.join(cleaned.split())
                cleaned_ingredients.append(cleaned)
            
            # Update results with cleaned names
            original_ingredients = results['ingredients']
            results['ingredients'] = cleaned_ingredients
            
            # Update blurbs and schemas keys
            new_blurbs = {}
            new_schemas = {}
            for orig, cleaned in zip(original_ingredients, cleaned_ingredients):
                if orig in results.get('blurbs', {}):
                    new_blurbs[cleaned] = results['blurbs'][orig]
                if orig in results.get('schemas', {}):
                    new_schemas[cleaned] = results['schemas'][orig]
            
            results['blurbs'] = new_blurbs
            results['schemas'] = new_schemas
        
        if 'error' in results:
            print(f"⚠️  No ingredients found: {results['error']}")
            return jsonify({
                'success': False,
                'error': results['error'],
                'raw_text': raw_text
            })
        
        print(f"✅ Found {len(results.get('ingredients', []))} ingredients")
        print("=" * 50 + "\n")
        
        return jsonify({
            'success': True,
            'raw_text': raw_text,
            'ingredients': results.get('ingredients', []),
            'blurbs': results.get('blurbs', {}),
            'schemas': results.get('schemas', {})
        })
        
    except Exception as e:
        print(f"❌ ERROR in analyze_image: {str(e)}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Handle chatbot queries about ingredients
    """
    try:
        print("\n💬 Received chat request")
        data = request.json
        question = data.get('question')
        
        if not question:
            return jsonify({
                'success': False,
                'error': 'No question provided'
            }), 400
        
        print(f"❓ Question: {question}")
        
        result = engine.generate(question, mode="chat", output_language="en")
        
        print(f"✅ Generated response")
        
        return jsonify({
            'success': True,
            'response': result.explanation.text
        })
        
    except Exception as e:
        print(f"❌ ERROR in chat: {str(e)}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


if __name__ == '__main__':
    print("\n" + "=" * 50)
    print("✅ All systems ready!")
    print("📍 Server running on http://localhost:5000")
    print("🌐 Test it: http://localhost:5000")
    print("=" * 50 + "\n")
    
    try:
        app.run(debug=True, port=5000, host='0.0.0.0')
    except Exception as e:
        print(f"\n❌ Server error: {e}")
        traceback.print_exc()