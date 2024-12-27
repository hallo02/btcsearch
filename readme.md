# **Searches for Bitcoin Addresses with Unspent Transaction Outputs (UTXOs)**

This application generates a randomly created private key and derives three types of Bitcoin addresses to check for **Unspent Transaction Outputs (UTXOs)**:

1. **Legacy Address** (P2PKH - Pay-to-PubKey-Hash)  
2. **SegWit Address** (P2SH - Pay-to-Script-Hash)  
3. **Native SegWit Address** (Bech32 - P2WPKH/P2WSH)

The generated addresses are validated against an in-memory set of known Bitcoin addresses. This set is sourced from the latest dataset available at:  
[http://addresses.loyce.club/Bitcoin_addresses_LATEST.txt.gz](http://addresses.loyce.club/Bitcoin_addresses_LATEST.txt.gz)

- The dataset is refreshed every **100'000'000 iterations** by default to ensure up-to-date results.

---

## **Configuration: .env File**

To configure the application, create a `.env` file with the following variables:

```env
VERIFICATION_PRIVATE_KEY=...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

#### Environment Variable Description

- `VERIFICATION_PRIVATE_KEY`:  
Provide a private key in WIF (Wallet Import Format) to test the application’s functionality. By default, this key will be used in iteration 100'000 to simulate a successful lookup.  
__Important: Do not share or push your private key publicly, as it is highly sensitive.__
- `TELEGRAM_BOT_TOKEN`:  
The application uses a Telegram bot for notifications. Provide your bot’s unique token.
- `TELEGRAM_CHAT_ID`:  
Specify the Telegram chat ID of the recipient who should receive the notifications.
