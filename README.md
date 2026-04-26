# NetFix - Network Troubleshooting Assistant

A neobrutalist AI-powered network diagnostics platform built with Next.js, featuring an intelligent chatbot and comprehensive network diagnostic tools.

## Features

### AI Troubleshooter
- Natural language network issue diagnosis
- Intelligent responses for DNS, WiFi, ping, firewall, VPN issues
- Structured step-by-step solutions

## Tech Stack

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **UI**: Neobrutalist design with Tailwind CSS v4
- **AI**: Hugging Face models via API
- **Backend**: Node.js with Express-like API routes
- **Infrastructure**: FastAPI integration

## Netfix Architecture 
<img width="1407" height="768" alt="image" src="https://github.com/user-attachments/assets/9dde9641-f531-4f75-affc-cdb7261079a3" />


## Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Access at http://localhost:3000
```

## Environment Variables

```env
HUGGINGFACE_API_KEY=your_key_here
KAFKA_BROKERS=localhost:9092  # Optional
```

## API Routes

### POST /api/chat
Sends a message to the AI chatbot.

```json
{
  "messages": [
    { "role": "user", "content": "My WiFi is slow" }
  ]
}
```

### POST /api/tools
Executes network diagnostic tools.

```json
{
  "tool": "ping",
  "host": "example.com",
  "count": 4
}
```

Available tools: ping, dns, port, traceroute, whois, speed

## Design

- **Colors**: White background, blue accents, black borders
- **Typography**: Space Grotesk (headings), Space Mono (code)
- **Theme**: Neobrutalist with dark mode support
- **Layout**: Mobile-first, responsive design

## Codebase

Highly optimized and consolidated:
- 6 files in components/ for UI
- 2 files in app/api/ for backend
- Single unified tools endpoint handling 6+ tools
- Removed 50+ documentation files and redundant routes
- ~3,000 lines of functional code

## License

MIT
