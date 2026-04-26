"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Loader2 } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your network troubleshooting assistant. Describe your network issue and I'll help you diagnose it.",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: "user", content: input.trim() }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const data = await response.json()
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I encountered an error. Please check the API connection and try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section id="chat" className="min-h-screen flex flex-col bg-secondary border-t-4 border-foreground">
      <div className="mx-auto w-full max-w-6xl px-6 py-8 flex-1 flex flex-col">
        <div className="mb-6">
          <h2 className="text-4xl font-bold text-foreground md:text-5xl">
            AI Troubleshooter
          </h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Powered by Hugging Face. Ask about any network issue.
          </p>
        </div>

        <div className="flex-1 flex flex-col border-4 border-foreground bg-background shadow-[8px_8px_0px_0px_var(--foreground)]">
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto border-b-4 border-foreground p-6">
            <div className="flex flex-col gap-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center border-3 border-foreground ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="h-5 w-5" />
                  ) : (
                    <Bot className="h-5 w-5" />
                  )}
                </div>
                <div
                  className={`max-w-[85%] border-3 border-foreground p-4 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <div className="text-xs leading-relaxed whitespace-pre-wrap font-mono">
                      {message.content.split("\n").map((line, idx) => (
                        <div key={idx} className={line.startsWith("•") ? "ml-4" : ""}>
                          {line}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  )}
                </div>
              </div>
            ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border-3 border-foreground bg-secondary text-secondary-foreground">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="border-3 border-foreground bg-secondary p-4">
                    <Loader2 className="h-5 w-5 animate-spin text-secondary-foreground" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input area */}
          <form onSubmit={handleSubmit} className="flex flex-shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your network issue..."
              className="flex-1 bg-background px-6 py-4 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="border-l-4 border-foreground bg-primary px-6 py-4 text-primary-foreground transition-colors hover:bg-foreground hover:text-background disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
              <span className="sr-only">Send message</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
