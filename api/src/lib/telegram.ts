import dns from 'node:dns'
import TelegramBot from 'node-telegram-bot-api'
import { env } from '../env'

// Prefer IPv4 to evitar ETIMEDOUT em hosts dual-stack
dns.setDefaultResultOrder('ipv4first')

const requestOptions = {
  family: 4,
  timeout: 30000,
  forever: true,
} as any

export const telegramBot = new TelegramBot(env.TELEGRAM_BOT_TOKEN, {
  request: requestOptions,
  webHook: {
    autoOpen: false,
  },
})
