from __future__ import annotations
import os
from openai import OpenAI

class OpenAISummarizer:
    def __init__(self, api_key: str | None = None):
        self.client = OpenAI(api_key=api_key or os.getenv("OPENAI_API_KEY"))

    def summarize(self, prompt: str, force_json: bool = False) -> str:
        """
        Summarize text via OpenAI. If force_json=True, use structured output enforcement.
        """
        try:
            # If forcing JSON, ensure the prompt explicitly contains "json"
            if force_json:
                if "json" not in prompt.lower():
                    prompt += "\n\nRespond only in valid JSON format."

                completion = self.client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[{"role": "user", "content": prompt}],
                    response_format={"type": "json_object"},  # Strict JSON
                )
            else:
                # Normal text response
                completion = self.client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[{"role": "user", "content": prompt}],
                )

            return completion.choices[0].message.content.strip()

        except Exception as e:
            return f"[Error: {e}]"

