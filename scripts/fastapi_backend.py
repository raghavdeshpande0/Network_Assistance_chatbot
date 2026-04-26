"""
FastAPI Backend for Network Troubleshooting Chatbot
====================================================
This is the reference FastAPI server that integrates with
Hugging Face's DialoGPT model for conversational AI.

To run:
  1. pip install fastapi uvicorn transformers torch
  2. uvicorn fastapi_backend:app --reload --port 8000

The frontend connects to this backend at http://localhost:8000/api/chat
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

# ── FastAPI App Setup ──────────────────────────────────────────────

app = FastAPI(
    title="NetFix - Network Troubleshooting API",
    description="AI-powered network troubleshooting chatbot backend",
    version="1.0.0",
)

# CORS configuration to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Hugging Face Model Integration ─────────────────────────────────

MODEL_NAME = "microsoft/DialoGPT-medium"
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(MODEL_NAME)

# ── Request/Response Models ────────────────────────────────────────

class Message(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: list[Message]

class ChatResponse(BaseModel):
    response: str

# ── API Routes ─────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "service": "NetFix Network Troubleshooting API",
        "status": "online",
        "model": MODEL_NAME,
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": model is not None}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Process a chat message and return an AI-generated response.

    The endpoint accepts a list of conversation messages and uses
    the DialoGPT model to generate a contextual response for
    network troubleshooting queries.
    """
    try:
        if not request.messages:
            raise HTTPException(status_code=400, detail="Messages are required")

        # Get the last user message
        user_messages = [m for m in request.messages if m.role == "user"]
        if not user_messages:
            raise HTTPException(status_code=400, detail="No user message found")

        last_message = user_messages[-1].content

        # Encode the user input
        input_ids = tokenizer.encode(
            last_message + tokenizer.eos_token,
            return_tensors="pt"
        )

        # Build conversation history for context (last 5 exchanges)
        chat_history_ids = None
        history_messages = request.messages[-10:]  # Last 10 messages
        for msg in history_messages[:-1]:  # Exclude the latest
            encoded = tokenizer.encode(
                msg.content + tokenizer.eos_token,
                return_tensors="pt"
            )
            if chat_history_ids is None:
                chat_history_ids = encoded
            else:
                chat_history_ids = torch.cat([chat_history_ids, encoded], dim=-1)

        # Combine history with current input
        if chat_history_ids is not None:
            bot_input_ids = torch.cat([chat_history_ids, input_ids], dim=-1)
        else:
            bot_input_ids = input_ids

        # Generate response
        with torch.no_grad():
            output = model.generate(
                bot_input_ids,
                max_length=1000,
                pad_token_id=tokenizer.eos_token_id,
                no_repeat_ngram_size=3,
                do_sample=True,
                top_k=50,
                top_p=0.95,
                temperature=0.7,
            )

        # Decode only the new tokens (the response)
        response_text = tokenizer.decode(
            output[:, bot_input_ids.shape[-1]:][0],
            skip_special_tokens=True
        )

        if not response_text.strip():
            response_text = (
                "I can help with network troubleshooting. "
                "Could you provide more details about your issue?"
            )

        return ChatResponse(response=response_text)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating response: {str(e)}"
        )


# ── Run Configuration ──────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
