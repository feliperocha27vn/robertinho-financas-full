import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { getContainer } from "../../container";

// Schema simplificado para o App Mobile
const chatPayloadSchema = z.object({
  text: z.string(),
  phone: z.string().default("mobile-client"),
});

export const webhookRoute: FastifyPluginAsyncZod = async (app) => {
  // Mantemos o endpoint /webhook mas agora ele ouve requisições diretas do App
  app.post(
    "/webhook",
    {
      schema: {
        body: chatPayloadSchema,
        response: {
          200: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
          400: z.object({
            error: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { text, phone } = request.body;

      try {
        if (!text) {
          return reply.status(400).send({
            error: "Texto da mensagem não pode ser vazio.",
          });
        }

        console.log(`💬 Processando mensagem do app [${phone}]:`, text);
        console.log("⏳ Enviando contexto para o Gemini...");

        // Chama a IA do Robertinho (o histórico é mantido pela chave "phone")
        const aiResponse = await getContainer().processMessage.execute({
          sessionId: phone,
          text,
        });

        console.log("🤖 Resposta do Gemini:", aiResponse.message);

        // Retorna a resposta HTTP diretamente para o App Mobile exibir na tela
        return reply.status(200).send({
          success: true,
          message: aiResponse.message,
        });
      } catch (error) {
        console.error("❌ Erro ao processar mensagem do chat:", error);
        return reply.status(400).send({
          error: "Erro interno ao processar mensagem com a IA",
        });
      }
    },
  );
};
