import Groq from 'groq-sdk';
import fs from 'fs';

const apiKey = process.env.GROQ_API_KEY;
const groq = new Groq({ apiKey });

async function run() {
  const imageBase64 = fs.readFileSync('300.jpg', { encoding: 'base64' });

  const body = {
    imageBase64,
    isletme: "Test Isletme",
    tasarimTuru: "Kurumsal",
    sorular: { markaAdi: "Test", kurumselRenk: "", isYapisi: "", hedefKitle: "", slogan: "" },
    guestMode: false
  };

  const resp = await fetch("http://localhost:3001/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const text = await resp.text();
  console.log("Status:", resp.status);
  console.log("Response text:", text.length > 300 ? text.substring(0, 300) + '...' : text);
}
run();
