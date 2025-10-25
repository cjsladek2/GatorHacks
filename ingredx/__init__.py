# ingredx/__init__.py
from dotenv import load_dotenv
import os

# Load .env automatically when ingredx is imported
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
load_dotenv(dotenv_path)

if not os.getenv("OPENAI_API_KEY"):
    print("⚠️  Warning: OPENAI_API_KEY not found in environment.")
