import { NextRequest, NextResponse } from "next/server"

const HF_API_URL =
  "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium"

const SYSTEM_CONTEXT = `You are a network troubleshooting assistant. You help users diagnose and resolve network issues including:
- Connectivity problems (WiFi, Ethernet, DNS)
- Slow internet speeds
- Firewall and port issues
- VPN and proxy configuration
- Router and switch troubleshooting
- IP address conflicts
- Packet loss and latency issues
Provide clear, step-by-step solutions.`

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      )
    }

    const lastUserMessage = messages
      .filter((m: { role: string }) => m.role === "user")
      .pop()

    if (!lastUserMessage) {
      return NextResponse.json(
        { error: "No user message found" },
        { status: 400 }
      )
    }

    const apiKey = process.env.HUGGINGFACE_API_KEY

    // If no HF API key, use a built-in diagnostic response
    if (!apiKey) {
      const diagnosticResponse = generateDiagnosticResponse(
        lastUserMessage.content
      )
      return NextResponse.json({ response: diagnosticResponse })
    }

    // Call Hugging Face Inference API
    const hfResponse = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: {
          past_user_inputs: messages
            .filter(
              (m: { role: string; content: string }) => m.role === "user"
            )
            .slice(0, -1)
            .map((m: { content: string }) => m.content),
          generated_responses: messages
            .filter(
              (m: { role: string; content: string }) => m.role === "assistant"
            )
            .slice(1)
            .map((m: { content: string }) => m.content),
          text: lastUserMessage.content,
        },
        parameters: {
          max_length: 500,
          temperature: 0.7,
        },
      }),
    })

    if (!hfResponse.ok) {
      const errorData = await hfResponse.text()
      console.error("HF API Error:", errorData)
      // Fallback to diagnostic response
      const diagnosticResponse = generateDiagnosticResponse(
        lastUserMessage.content
      )
      return NextResponse.json({ response: diagnosticResponse })
    }

    const data = await hfResponse.json()
    const generatedText =
      data.generated_text || data[0]?.generated_text || "I couldn't process that. Could you rephrase your network issue?"

    return NextResponse.json({ response: generatedText })
  } catch (error) {
    console.error("Chat API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

interface Response {
  solution: string[]
}

function formatResponse(response: Response): string {
  let formatted = ""
  response.solution.forEach((step, i) => {
    formatted += `${i + 1}. ${step}\n`
  })
  return formatted
}

const ERROR_PATTERNS: Record<string, { keywords: string[]; solutions: string[] }> = {
  dns: {
    keywords: ["dns", "resolve", "domain", "nxdomain", "enotfound", "cannot find"],
    solutions: [
      "Flush your DNS cache to clear outdated records:\n   - Windows: ipconfig /flushdns\n   - macOS: sudo dscacheutil -flushcache\n   - Linux: sudo systemd-resolve --flush-caches",
      "Switch to a public DNS server if your ISP's DNS is slow:\n   - Google DNS: 8.8.8.8 / 8.8.4.4\n   - Cloudflare DNS: 1.1.1.1 / 1.0.0.1\n   - Quad9 DNS: 9.9.9.9",
      "Test DNS resolution with nslookup or dig:\n   - nslookup example.com\n   - dig example.com (Linux/macOS)\n   - nslookup -type=MX example.com (check mail records)",
      "Check your system DNS configuration:\n   - Linux/macOS: cat /etc/resolv.conf\n   - Windows: ipconfig /all (look for DNS Servers section)",
      "If issue persists, restart your router and modem (unplug for 30 seconds)"
    ]
  },
  speed: {
    keywords: ["slow", "speed", "bandwidth", "fast", "throttle", "lag"],
    solutions: [
      "Establish a baseline by running a speed test:\n   - Visit speedtest.net, fast.com, or use your ISP speed test tool\n   - Record download, upload, and ping results",
      "Identify bandwidth-consuming processes:\n   - Windows: Open Task Manager > Performance tab\n   - macOS: Open Activity Monitor > Network tab\n   - Linux: Use 'nethogs' or 'iftop' to monitor bandwidth",
      "Test wired vs. wireless connection:\n   - Connect directly via Ethernet cable to isolate WiFi issues\n   - If wired is fast, issue is WiFi-related; if both slow, issue is ISP/network",
      "Reduce WiFi interference:\n   - Move closer to router\n   - Switch to less congested WiFi channel (1, 6, 11 for 2.4GHz; any for 5GHz)\n   - Use WiFi analyzer app to find optimal channel",
      "Restart network equipment:\n   - Unplug modem for 30 seconds, then plug back in\n   - Wait 2 minutes for full initialization\n   - Unplug router, wait 30 seconds, plug back in"
    ]
  },
  wifi: {
    keywords: ["wifi", "wireless", "connect", "disconnect", "wlan", "ssid", "authentication failed"],
    solutions: [
      "Perform a simple toggle:\n   - Turn WiFi off and on in your device settings\n   - Wait 10 seconds between toggles",
      "Forget and reconnect to the network:\n   - Go to WiFi Settings > Forget Network > Search for network > Reconnect with password",
      "Verify the WiFi password:\n   - Check your router's label or admin panel\n   - Ensure Caps Lock is off and special characters are correct",
      "Restart your router:\n   - Unplug power cable for 30 seconds\n   - Plug back in and wait 2-3 minutes for full boot\n   - Look for solid lights indicating normal operation",
      "Check if other devices can connect:\n   - Test with phone, tablet, or another computer\n   - If only one device fails, update its WiFi drivers\n   - If all devices fail, router may need restart or factory reset"
    ]
  },
  latency: {
    keywords: ["ping", "latency", "packet loss", "jitter", "timeout", "slow response"],
    solutions: [
      "Test basic connectivity with ping:\n   - ping 8.8.8.8 (tests internet connectivity to Google DNS)\n   - ping 1.1.1.1 (tests internet connectivity to Cloudflare)\n   - ping your-gateway (test local network gateway)",
      "Run extended ping test to check packet loss:\n   - Linux/macOS: ping -c 100 8.8.8.8 (sends 100 packets)\n   - Windows: ping -n 100 8.8.8.8\n   - Look for '0% loss' (good) or anything above 5% (bad)",
      "Measure latency with ping to different locations:\n   - Local: ping your.local.gateway (should be <10ms)\n   - Regional: ping 8.8.8.8 (typically 10-50ms)\n   - International: ping google.com in different country (50-200ms)",
      "Run traceroute to identify where latency increases:\n   - Linux/macOS: traceroute -m 20 8.8.8.8 (shows all hops)\n   - Windows: tracert 8.8.8.8\n   - Excessive latency at specific hop indicates problem point",
      "If packet loss detected, restart modem and router:\n   - Unplug both for 60 seconds\n   - Plug in modem first, wait for stable connection\n   - Then plug in router and wait for initialization"
    ]
  },
  firewall: {
    keywords: ["firewall", "port", "blocked", "allow", "deny", "inbound", "outbound"],
    solutions: [
      "Check if a port is open and listening:\n   - Linux: sudo netstat -tuln | grep LISTEN (shows all listening ports)\n   - Windows: netstat -ano (use Task Manager to match PID to process)\n   - macOS: lsof -i -P -n | grep LISTEN",
      "Use port checking tools to verify from remote:\n   - Linux/macOS: nc -zv example.com 443 (connect test)\n   - Online tool: canyouseeme.org to check if port is accessible from internet",
      "Common ports to check:\n   - 80/443: HTTP/HTTPS web traffic\n   - 22: SSH remote access\n   - 53: DNS queries\n   - 3306: MySQL database\n   - 5432: PostgreSQL database",
      "Create firewall rule to allow traffic:\n   - Windows: New Inbound Rule > Port > TCP > Specific port > Allow\n   - Linux: sudo ufw allow 8080 (allows port 8080)\n   - macOS: System Preferences > Security & Privacy > Firewall Options",
      "Test by temporarily disabling firewall (re-enable immediately after):\n   - Windows: netsh advfirewall set allprofiles state off\n   - Linux: sudo ufw disable\n   - macOS: System Preferences > Security & Privacy > Firewall > turn off"
    ]
  },
  vpn: {
    keywords: ["vpn", "tunnel", "proxy", "openvpn", "wireguard", "expressVpn"],
    solutions: [
      "Verify VPN connection status:\n   - Check if VPN shows as 'Connected' in your application\n   - Verify your IP has changed: whatismyipaddress.com\n   - Should show VPN provider's country/IP",
      "Reconnect to VPN:\n   - Disconnect from current VPN server\n   - Try connecting to a different server location\n   - Wait 30 seconds between disconnecting and reconnecting",
      "Try different VPN protocol:\n   - Switch from WireGuard to OpenVPN, IKEv2, or L2TP\n   - Different protocols have different speeds and compatibility\n   - Settings usually found in VPN app > Protocol or Connection settings",
      "Check if ISP is blocking VPN:\n   - If VPN works on mobile hotspot but not home WiFi, ISP may block it\n   - Try using port 443 (HTTPS port) instead of default 1194\n   - Consider obfuscation options if available",
      "Flush DNS cache after VPN connection:\n   - Windows: ipconfig /flushdns\n   - macOS: sudo dscacheutil -flushcache\n   - Linux: sudo systemd-resolve --flush-caches"
    ]
  },
  http_error: {
    keywords: ["400", "401", "403", "404", "500", "502", "503", "504", "error", "failed"],
    solutions: [
      "For 400 Bad Request errors:\n   - Check the URL syntax is correct\n   - Verify query parameters are properly formatted\n   - Look for special characters that need encoding\n   - Clear browser cache and cookies",
      "For 401/403 Unauthorized/Forbidden errors:\n   - Verify you have correct authentication credentials\n   - Check if your API key/token has expired\n   - Ensure you have proper permissions for the resource\n   - Try logging out and back in",
      "For 404 Not Found errors:\n   - Double-check the URL spelling\n   - Verify the resource hasn't been moved or deleted\n   - Check if the domain is correct\n   - Try accessing from a different network",
      "For 500/502/503 Server errors:\n   - Wait a few minutes as server may be recovering\n   - Try refreshing the page or clearing cache\n   - Check if the server status page shows issues\n   - Contact the service provider if problem persists",
      "For timeout/connection errors:\n   - Check your internet connection\n   - Verify firewall isn't blocking the connection\n   - Try accessing from a different network\n   - Check if the server is reachable with ping"
    ]
  },
  connection: {
    keywords: ["econnrefused", "econnreset", "etimedout", "refused", "reset", "connection", "unreachable"],
    solutions: [
      "ECONNREFUSED - Connection Refused:\n   - Service not running or not listening on target port\n   - Verify service is started: systemctl status servicename\n   - Check correct host and port are used\n   - Ensure firewall allows the connection",
      "ECONNRESET - Connection Reset by Peer:\n   - Server crashed or forcibly closed the connection\n   - Check server logs for errors\n   - Verify server has sufficient resources (CPU, memory)\n   - Try reconnecting after waiting a moment",
      "ETIMEDOUT - Connection Timed Out:\n   - Server not responding within the timeout period\n   - Check network connectivity: ping <server>\n   - Verify server is running and accessible\n   - Increase timeout value in client configuration",
      "Connection refused on specific port:\n   - Port may be blocked by firewall\n   - Service may not be listening on that port\n   - Use netstat to check: netstat -tuln | grep <port>\n   - Check SELinux or AppArmor policies",
      "Intermittent connection issues:\n   - Check for network instability: ping -c 50 <server>\n   - Monitor system resources during connection attempts\n   - Check for connection limits on server\n   - Enable verbose logging to see exact failure point"
    ]
  },
  ssl_tls: {
    keywords: ["ssl", "tls", "certificate", "cert", "https", "secure", "handshake", "expired"],
    solutions: [
      "SSL Certificate Expired:\n   - Check certificate expiry: openssl s_client -connect example.com:443 -showcerts\n   - Renew the certificate immediately\n   - Verify current date on system is correct\n   - Clear browser cache and try accessing again",
      "Certificate Hostname Mismatch:\n   - Verify domain name matches certificate Subject/CN\n   - Check certificate SANs (Subject Alternative Names)\n   - Ensure you're using the correct domain\n   - For localhost, use self-signed certificate",
      "Self-Signed Certificate Issues:\n   - Add certificate to trusted store:\n     - Windows: Import to Trusted Root Certification Authorities\n     - macOS: Keychain Access > Add certificate\n     - Linux: /usr/local/share/ca-certificates/ (requires update-ca-certificates)",
      "TLS Version Mismatch:\n   - Check supported TLS versions: openssl s_client -tls1_2 -connect example.com:443\n   - Enable TLS 1.2 or higher in client\n   - Update OpenSSL to latest version\n   - Verify server supports your TLS version",
      "Certificate Chain Issues:\n   - Verify full certificate chain is installed\n   - Check for missing intermediate certificates\n   - Use online certificate checker: ssllabs.com\n   - Contact certificate provider for chain"
    ]
  }
}

function generateDiagnosticResponse(userMessage: string): string {
  const message = userMessage.toLowerCase()

  // Check for HTTP error codes
  const httpErrors = message.match(/\b(400|401|403|404|500|502|503|504)\b/g)
  if (httpErrors) {
    const response: Response = {
      solution: ERROR_PATTERNS.http_error.solutions
    }
    return formatResponse(response)
  }

  // Check for connection errors
  const connectionErrors = ["econnrefused", "econnreset", "etimedout", "refused", "reset", "connection refused"]
  if (connectionErrors.some(err => message.includes(err))) {
    const response: Response = {
      solution: ERROR_PATTERNS.connection.solutions
    }
    return formatResponse(response)
  }

  // Check for SSL/TLS errors
  const sslErrors = ["ssl", "tls", "certificate", "cert", "https", "secure", "handshake", "expired"]
  if (sslErrors.some(err => message.includes(err))) {
    const response: Response = {
      solution: ERROR_PATTERNS.ssl_tls.solutions
    }
    return formatResponse(response)
  }

  // Check for pattern matches
  for (const [category, pattern] of Object.entries(ERROR_PATTERNS)) {
    if (category !== "http_error" && category !== "connection" && category !== "ssl_tls" && pattern.keywords.some(k => message.includes(k))) {
      const response: Response = {
        solution: pattern.solutions
      }
      return formatResponse(response)
    }
  }

  // Check legacy conditions


  const response: Response = {
    solution: [
      "Describe your network issue in detail with these key information:\n   - What error messages you see (exact text if possible)\n   - When the issue started (after system update, suddenly, etc.)\n   - Which device is affected (all devices or just one)",
      "Tell me what you've already tried:\n   - Have you restarted the device/router?\n   - Have you checked device settings?\n   - Have you tested with different networks?",
      "Provide environment context:\n   - Your operating system (Windows, macOS, Linux, iOS, Android)\n   - Connection type (WiFi, Ethernet, 4G/5G)\n   - Affected services (internet, specific app, gaming, video call)",
      "I can help with these common issues:\n   - DNS resolution failures\n   - Slow internet/bandwidth problems\n   - WiFi connectivity issues\n   - Ping, latency & packet loss\n   - Firewall & port configuration\n   - VPN troubleshooting\n   - Router/modem issues",
      "Provide additional context if available:\n   - Have you checked Activity Monitor/Task Manager for resource usage?\n   - Is your router/modem hot to touch (overheating)?\n   - Have you checked for recent system updates that might have caused issues?"
    ]
  }
  return formatResponse(response)
}
