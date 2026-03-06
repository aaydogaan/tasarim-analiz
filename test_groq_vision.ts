import Groq from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY;
const groq = new Groq({ apiKey });

async function run() {
  const models = [
    "llama-3.1-8b-instant",
    "moonshotai/kimi-k2-instruct",
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "qwen/qwen3-32b",
    "meta-llama/llama-4-scout-17b-16e-instruct",
    "meta-llama/llama-4-maverick-17b-128e-instruct",
    "llama-3.3-70b-versatile"
  ];
  
  const imageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
  
  for (const m of models) {
    try {
      await groq.chat.completions.create({
        model: m,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: "Hello, what is this image?" },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
            ],
          },
        ],
      });
      console.log(`${m}: SUCCESS WITH VISION!`);
      return;
    } catch (e: any) {
      console.log(`${m}: FAILED - ${e.message}`);
    }
  }
}
run();
