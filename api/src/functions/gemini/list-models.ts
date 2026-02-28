import { gemini } from "../../lib/google-gen-ai";

async function run() {
  try {
    const response = await gemini.models.generateContent({
      model: 'gemini-flash-latest',
      contents: 'Olá, me diga o seu modelo.',
    });
    console.log('Success:', response.text);
  } catch (err) {
    console.log('Error:', err);
  }
}
run();
