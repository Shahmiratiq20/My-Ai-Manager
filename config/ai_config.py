import os
from openai import OpenAI
from dotenv import load_dotenv

class AIEngine:
    def __init__(self):
        load_dotenv()

        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            raise ValueError("OPENROUTER_API_KEY not found in .env file")

        self.client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
            default_headers={
                "HTTP-Referer": "http://localhost",
                "X-Title": "AI Employee System"
            }
        )

        # 🔥 Working Model
        self.model = "mistralai/mistral-7b-instruct"

    def process_task(self, task_content):
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an AI Employee assistant. Be concise and actionable."
                    },
                    {
                        "role": "user",
                        "content": f"""Task: {task_content}

Create action plan:
1. What needs to be done
2. Priority
3. Next steps"""
                    }
                ],
                temperature=0.7,
                max_tokens=500
            )

            return response.choices[0].message.content

        except Exception as e:
            return f"❌ Error while processing task: {str(e)}"


if __name__ == "__main__":
    engine = AIEngine()
    result = engine.process_task("Launch a marketing campaign for new AI SaaS product")
    print("\n=== AI Generated Plan ===\n")
    print(result)
