# NetFix - Network Troubleshooting Assistant

A neobrutalist AI-powered network diagnostics platform built with Next.js, featuring an intelligent chatbot and comprehensive network diagnostic tools.

## Features

### AI Troubleshooter
- Natural language network issue diagnosis
- Intelligent responses for DNS, WiFi, ping, firewall, VPN issues
- Structured step-by-step solutions

### Network Diagnostic Tools
- **Ping Test** - Check host reachability and latency
- **DNS Lookup** - Resolve domains and inspect DNS records
- **Port Scanner** - Scan ports and detect services
- **Traceroute** - Trace packet routes
- **Whois Lookup** - Query domain registration details
- **Speed Test** - Measure bandwidth and latency

### Additional Diagnostics
- **IP Info / Geo Lookup** - Location and ISP information
- **SSL/TLS Inspector** - Certificate validation and details
- **HTTP Header Inspector** - Request/response header analysis
- **Error Explainer** - AI-powered error diagnosis
- **CIDR Calculator** - Network range calculations

## Tech Stack

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **UI**: Neobrutalist design with Tailwind CSS v4
- **AI**: Hugging Face models via API
- **Backend**: Node.js with Express-like API routes
- **Infrastructure**: Docker + Kafka (optional)

## File Structure

```
app/
├── api/
│   ├── chat/route.ts          # AI chatbot endpoint
│   └── tools/route.ts         # Unified diagnostic tools API
├── layout.tsx                 # Root layout with dark mode
└── page.tsx                   # Main page

components/
├── header.tsx                 # Header with dark theme toggle
├── hero.tsx                   # Large hero section
├── chat-interface.tsx         # Full-screen chat UI
├── network-tools.tsx          # Expandable tool cards
├── diagnostic-tools.tsx       # Additional diagnostic cards
└── footer.tsx                 # Footer

lib/
├── kafka.ts                   # Kafka producer client (optional)
└── utils.ts                   # Utility functions
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Access at http://localhost:3000
```

## Docker Deployment

```bash
# Build image
docker build -t netfix:latest .

# Run with Docker Compose
docker-compose up -d
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
