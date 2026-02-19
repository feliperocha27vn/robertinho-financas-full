import { GoogleGenAI } from '@google/genai'

// Prefer explicit GEMINI_API_KEY, fall back to AUTHENTICATION_API_KEY (from .env)
const geminiApiKey =
  process.env.GEMINI_API_KEY || process.env.AUTHENTICATION_API_KEY || ''

if (!geminiApiKey) {
  // Log a clear warning so developers know why requests may be rejected with 403
  // (process.env may be loaded via dotenv elsewhere in the app)
  // eslint-disable-next-line no-console
  console.warn(
    '[google-gen-ai] warning: GEMINI API key is not set (GEMINI_API_KEY or AUTHENTICATION_API_KEY)'
  )
}

export const gemini = new GoogleGenAI({
  apiKey: geminiApiKey,
})
