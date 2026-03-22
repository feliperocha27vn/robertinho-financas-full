import dns from 'node:dns'
import TelegramBot from 'node-telegram-bot-api'
import { env } from '../env'

// Prefer IPv4 to evitar ETIMEDOUT em hosts dual-stack
dns.setDefaultResultOrder('ipv4first')

export const telegramBot = new TelegramBot(env.TELEGRAM_BOT_TOKEN, {
  polling: {
    interval: 2000,
    params: { timeout: 20, allowed_updates: ['message'] },
  },
})
