import z from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  GEMINI_API_KEY: z.string(),
  TELEGRAM_BOT_TOKEN: z.string(),
  TELEGRAM_WEBHOOK_SECRET: z.string().optional(),
  CLIENT_EMAIL: z.string(),
  PRIVATE_KEY_CALENDER: z.string(),
  GOOGLE_PERSONAL_EMAIL: z.string(),
})

export const env = envSchema.parse(process.env)
