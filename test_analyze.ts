import fs from 'fs';

async function test() {
  const imageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
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
  console.log("Response text:", text);
}
test();
