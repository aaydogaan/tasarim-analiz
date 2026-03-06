import Groq from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY;
const groq = new Groq({ apiKey });

async function run() {
  const models = ['llama-3.2-11b-vision-preview', 'llama-3.2-90b-vision-preview', 'llama-3.2-90b-text-preview', 'meta-llama/llama-4-scout-17b-16e-instruct', 'llama-3.2-11b-text-preview', 'mixtral-8x7b-32768'];
  for (const m of models) {
    try {
      const resp = await groq.chat.completions.create({
        model: m,
        messages: [{ role: 'user', content: "Hello" }],
      });
      console.log(`${m}: SUCCESS`);
    } catch (e: any) {
      console.log(`${m}: FAILED - ${e.message}`);
    }
  }
}
run();
