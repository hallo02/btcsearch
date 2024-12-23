import TelegramBot, { Message } from "node-telegram-bot-api";

let botToken: string;
let chatId: string;
let bot: TelegramBot;

export function initBot() {
  botToken = process.env.TELEGRAM_BOT_TOKEN as string;
  chatId = process.env.TELEGRAM_CHAT_ID as string;
  bot = new TelegramBot(botToken);
}

async function sendMessage(msg: string) {
  return bot.sendMessage(chatId, msg);
}

export default sendMessage;
