from fastapi import APIRouter, HTTPException
from openai import OpenAI
import os
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()

chatbot_router = APIRouter()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class ChatbotRequest(BaseModel):
    user_message: str

@chatbot_router.post("/")
async def chatbot_interaction(request: ChatbotRequest):
    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": request.user_message}]
        )

        return {"response": completion.choices[0].message.content}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
