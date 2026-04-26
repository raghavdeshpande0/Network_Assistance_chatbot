import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { ChatInterface } from "@/components/chat-interface"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <ChatInterface />
    </main>
  )
}
