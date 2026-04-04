import { GoogleGenAI } from '@google/genai'
import type {
  AiConversationContext,
  AiConversationResult,
  AiProvider,
  ToolCall,
} from './ai-provider'
import { financeFunctionDeclarations } from './gemini/declarations/finance-tools'
import { buildSystemContext } from './system/build-system-context'

const model = 'gemini-2.5-flash'

type GenPart =
  | { text: string }
  | { functionCall: { name: string; args?: Record<string, unknown> } }
  | {
      functionResponse: {
        name: string
        response: { result: unknown }
      }
    }

type GenContent = {
  role: 'user' | 'model'
  parts: GenPart[]
}

interface GeminiClient {
  models: {
    generateContent(args: any): Promise<{
      text?: string
      functionCalls?: Array<{ name?: string; args?: Record<string, unknown> }>
    }>
  }
}

function toGeminiContents(
  history: AiConversationContext['history'],
  userMessage: string
): GenContent[] {
  const contents: GenContent[] = history.map(item => ({
    role: item.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: item.content }],
  }))

  contents.push({
    role: 'user',
    parts: [{ text: userMessage }],
  })

  return contents
}

function buildSystemContextPart(context: AiConversationContext): GenPart {
  return {
    text: buildSystemContext({
      currentState: context.currentState,
      pendingData: context.pendingData,
    }),
  }
}

export class GeminiAiProvider implements AiProvider {
  private readonly client: GeminiClient

  constructor(params?: { client?: GeminiClient; apiKey?: string }) {
    if (params?.client) {
      this.client = params.client
      return
    }

    const apiKey = params?.apiKey ?? process.env.GEMINI_API_KEY

    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY is required to initialize GeminiAiProvider'
      )
    }

    this.client = new GoogleGenAI({ apiKey })
  }

  async generateReply(
    userMessage: string,
    context: AiConversationContext
  ): Promise<AiConversationResult> {
    const contents = toGeminiContents(context.history, userMessage)
    contents.unshift({ role: 'user', parts: [buildSystemContextPart(context)] })

    let response = await this.client.models.generateContent({
      model,
      contents,
      config: {
        tools: [{ functionDeclarations: financeFunctionDeclarations }],
      },
    })

    const nextHistory = [
      ...context.history,
      { role: 'user' as const, content: userMessage },
    ]

    let safetyCounter = 0
    while (response.functionCalls && response.functionCalls.length > 0) {
      safetyCounter += 1
      if (safetyCounter > 5) {
        break
      }

      const calls = response.functionCalls
      for (const rawCall of calls) {
        const call: ToolCall = {
          name: rawCall.name ?? '',
          args: rawCall.args ?? {},
        }

        const toolResult = await context.executeTool(call)

        contents.push({
          role: 'model',
          parts: [
            {
              functionCall: {
                name: call.name,
                args: call.args,
              },
            },
          ],
        })

        contents.push({
          role: 'user',
          parts: [
            {
              functionResponse: {
                name: call.name,
                response: { result: toolResult },
              },
            },
          ],
        })
      }

      response = await this.client.models.generateContent({
        model,
        contents,
        config: {
          tools: [{ functionDeclarations: financeFunctionDeclarations }],
        },
      })
    }

    const rawMessage = response.text?.trim() || 'Nao consegui responder agora.'
    const message = rawMessage
      .replace(/\[functionCall\][\s\S]*?(?=✅|📊|💰|$)/g, '')
      .replace(/\[functionResponse\][\s\S]*?(?=✅|📊|💰|$)/g, '')
      .trim()
    nextHistory.push({ role: 'assistant', content: message })

    return {
      message,
      history: nextHistory.slice(-20),
    }
  }
}
