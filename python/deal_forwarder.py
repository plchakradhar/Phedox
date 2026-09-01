import os
import asyncio
from aiohttp import web
from telethon import TelegramClient, events
from telethon.sessions import StringSession

# 1. Configuration & Credentials (via Environment Variables or Defaults)
API_ID = int(os.getenv("TELEGRAM_API_ID", "37012484"))
API_HASH = os.getenv("TELEGRAM_API_HASH", "d7a970db114cfdc5e926f8b765ef484a")
SESSION_STRING = os.getenv("TELEGRAM_STRING_SESSION", "").strip()
EXTRAPE_BOT = os.getenv("EXTRAPE_BOT", "ExtraPeBot").strip()

# 2. Channels to Monitor Simultaneously
# Supports channel usernames, links, or invite links
raw_channels = os.getenv("SOURCE_CHANNELS", "iamprasadtech,TechFactsDeals,VasuTechDeals")
SOURCE_CHANNELS = [ch.strip().replace("https://t.me/", "") for ch in raw_channels.split(",") if ch.strip()]

# 3. Initialize Telegram Client (StringSession for headless cloud, or file session locally)
if SESSION_STRING:
    session = StringSession(SESSION_STRING)
    print("Using StringSession for cloud authentication.")
else:
    session = "deal_forwarder_session"
    print("Using local file session 'deal_forwarder_session'.")

client = TelegramClient(session, API_ID, API_HASH)

# 4. Message Event Handler
@client.on(events.NewMessage(chats=SOURCE_CHANNELS))
async def forward_to_extrape(event):
    try:
        chat = await event.get_chat()
        chat_title = getattr(chat, "title", str(event.chat_id))
        print(f"\n[NEW DEAL] Received message from: {chat_title} (ID: {event.chat_id})")
        print(f"Forwarding message to @{EXTRAPE_BOT}...")
        
        # Forward or copy message (preserves text, formatting, and images/media)
        await client.send_message(EXTRAPE_BOT, event.message)
        print(f"[SUCCESS] Deal forwarded to @{EXTRAPE_BOT} successfully!\n")
    except Exception as e:
        print(f"[ERROR] Failed to forward message: {e}")

# 5. Lightweight HTTP Server for Cloud Health Checks & Uptime Keep-Alive
async def handle_health(request):
    is_connected = client.is_connected()
    status_text = (
        f"Phedox Telegram Deal Forwarder is RUNNING\n"
        f"Telethon Connected: {is_connected}\n"
        f"Monitoring Channels: {', '.join(SOURCE_CHANNELS)}\n"
        f"Forwarding to: @{EXTRAPE_BOT}\n"
    )
    return web.Response(text=status_text, status=200 if is_connected else 503)

async def start_http_server():
    port = int(os.getenv("PORT", "8080"))
    app = web.Application()
    app.router.add_get("/", handle_health)
    app.router.add_get("/health", handle_health)
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, "0.0.0.0", port)
    await site.start()
    print(f"[SERVER] Health check server listening on http://0.0.0.0:{port}")

# 6. Main Async Entrypoint
async def main():
    print("=" * 60)
    print("Starting Phedox Telegram Deal Forwarder...")
    print(f"Target Bot: @{EXTRAPE_BOT}")
    print(f"Monitored Channels: {SOURCE_CHANNELS}")
    print("=" * 60)

    # Start Telethon Client
    await client.start()
    print("[TELETHON] Client started and authenticated successfully!")

    # Start HTTP Health Server in background
    await start_http_server()

    # Keep worker running
    print("[RUNNING] Listening for new channel posts 24/7. Ready!\n")
    await client.run_until_disconnected()

if __name__ == "__main__":
    asyncio.run(main())