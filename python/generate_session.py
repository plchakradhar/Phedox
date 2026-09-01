from telethon.sync import TelegramClient
from telethon.sessions import StringSession
import getpass

print("=" * 65)
print("  Phedox - Telegram StringSession Key Generator (Run Locally Once)")
print("=" * 65)

api_id_input = input("Enter your API ID [Press Enter for default: 37012484]: ").strip()
API_ID = int(api_id_input) if api_id_input else 37012484

api_hash_input = input("Enter your API HASH [Press Enter for default]: ").strip()
API_HASH = api_hash_input if api_hash_input else "d7a970db114cfdc5e926f8b765ef484a"

print("\nConnecting to Telegram... (You will be prompted for Phone & OTP code)")
with TelegramClient(StringSession(), API_ID, API_HASH) as client:
    session_string = client.session.save()
    print("\n" + "=" * 65)
    print("SUCCESS! HERE IS YOUR STRING SESSION TOKEN:")
    print("=" * 65)
    print(session_string)
    print("=" * 65)
    print("👉 Copy the token above and paste it into Render Environment Variables:")
    print("   Key:   TELEGRAM_STRING_SESSION")
    print("   Value: <paste_the_token_here>")
    print("=" * 65 + "\n")
