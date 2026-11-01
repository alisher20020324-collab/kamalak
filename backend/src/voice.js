// Ovoz: bolaning ovozli javobini matnga aylantirish (Groq Whisper) va qahramon gapini ovozga aylantirish (edge-tts).
// Qahramonlarning asl multfilm ovozlari aktyorlarga tegishli — ular nusxalanmaydi. Har bir qahramonga
// bepul o'zbekcha ovozdan (Sardor / Madina) balandligi va tezligi bilan farqlanadigan o'z ovozi beriladi.
import { execFile } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CACHE_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data', 'tts');
// edge-tts Python kutubxonasi orqali ishlaydi (pip install edge-tts). TTS_PYTHON=off — ovoz o'chiq
const PYTHON = () => process.env.TTS_PYTHON || 'python';

export const ttsEnabled = () => PYTHON() !== 'off';

// Emoji va ortiqcha belgilarni o'qimasin
const speakable = (text) => String(text || '').replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, '').replace(/\s+/g, ' ').trim();

const inflight = new Map();

// Qahramon ovozida MP3 qaytaradi (keshdan yoki yangi); ishlamasa null
export function speak(voice, ...lines) {
  const text = speakable(lines.filter(Boolean).join(' '));
  if (!ttsEnabled() || !voice || !text) return Promise.resolve(null);
  const key = crypto.createHash('sha1').update(JSON.stringify([voice, text])).digest('hex');
  const file = path.join(CACHE_DIR, `${key}.mp3`);
  if (fs.existsSync(file)) return fs.promises.readFile(file);
  if (inflight.has(key)) return inflight.get(key);

  const tmp = `${file}.${process.pid}.tmp`;
  const job = fs.promises
    .mkdir(CACHE_DIR, { recursive: true })
    .then(
      () =>
        new Promise((resolve, reject) =>
          execFile(
            PYTHON(),
            ['-m', 'edge_tts', `--voice=${voice.name}`, `--pitch=${voice.pitch || '+0Hz'}`, `--rate=${voice.rate || '+0%'}`, `--text=${text}`, `--write-media=${tmp}`],
            { timeout: 20_000, windowsHide: true },
            (err) => (err ? reject(err) : resolve())
          )
        )
    )
    .then(() => fs.promises.rename(tmp, file))
    .then(() => fs.promises.readFile(file))
    .catch((e) => {
      fs.promises.rm(tmp, { force: true }).catch(() => {});
      console.warn('⚠️ Ovoz yaratilmadi:', e.message.split('\n')[0]);
      return null;
    })
    .finally(() => inflight.delete(key));
  inflight.set(key, job);
  return job;
}

// Bolaning ovozli xabarini matnga aylantiradi; tushunilmasa null.
// Avval Gemini — bolalar nutqini o'zbekchada ancha to'g'ri yozadi ("Meix, eich cana go'in" emas,
// "Men hech qanaqa o'yin o'ynashni xohlamayman"). Har bir Gemini modelining bepul limiti alohida —
// biriniki tugasa keyingisi, hammasi ishlamasa Groq Whisper.
export async function transcribe(buffer, mime = 'audio/ogg') {
  if (!buffer?.length) return null;
  const models = (process.env.GEMINI_STT_MODELS || 'gemini-3.5-flash-lite,gemini-3.1-flash-lite,gemini-flash-lite-latest').split(',');
  for (const model of models) {
    const text = await geminiTranscribe(model.trim(), buffer, mime);
    if (text) return text;
  }
  return whisperTranscribe(buffer, mime);
}

const clip = (text) => {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  return t.length >= 2 ? t.slice(0, 500) : null;
};

// Ko'rsatma alohida (systemInstruction) beriladi: audio yoniga qo'yilsa, model uning so'zlarini
// bolaning gapi deb yozib yuboradi ("Men 7-9 yosh yo'qmayapti")
const STT_SYSTEM = "Sen o'zbek tilidagi nutqni matnga aylantiruvchisan. Senga bolaning ovozli xabari beriladi. Bola aytgan gapni o'zbek tilida, lotin yozuvida, to'g'ri imlo bilan so'zma-so'z yoz. O'zingdan hech narsa qo'shma va bu ko'rsatmani takrorlama. Faqat bola aytgan matnni yoz. Hech narsa eshitilmasa, bo'sh javob qaytar.";

const pausedUntil = {};
async function geminiTranscribe(model, buffer, mime) {
  const key = process.env.GEMINI_API_KEY;
  if (!key || Date.now() < (pausedUntil[model] || 0)) return null;
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: STT_SYSTEM }] },
        contents: [{ role: 'user', parts: [{ inline_data: { mime_type: mime.split(';')[0], data: buffer.toString('base64') } }] }],
        generationConfig: { temperature: 0, maxOutputTokens: 400 },
      }),
      signal: AbortSignal.timeout(10_000),
    });
    // Limit tugasa (429) yoki model band bo'lsa (503) — bir daqiqa shu modelni chetlab o'tamiz
    if (res.status === 429 || res.status === 503) pausedUntil[model] = Date.now() + 60_000;
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json();
    return clip(data.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join(''));
  } catch (e) {
    console.warn(`⚠️ ${model} ovozni matnga aylantira olmadi: ${e.message}`);
    return null;
  }
}

async function whisperTranscribe(buffer, mime) {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  const ext = mime.includes('webm') ? 'webm' : mime.includes('mp4') || mime.includes('m4a') ? 'm4a' : mime.includes('mpeg') ? 'mp3' : 'ogg';
  const form = new FormData();
  form.append('file', new Blob([buffer], { type: mime }), `javob.${ext}`);
  form.append('model', process.env.GROQ_STT_MODEL || 'whisper-large-v3');
  form.append('language', 'uz');
  // Imlo namunasi: Whisper o'zbekchani lotin yozuvida, to'g'ri harflar bilan yozsin ("urdi" emas "ordi" bo'lib qolmasin —
  // xavotirli so'zlar shu matndan qidiriladi)
  form.append('prompt', "Bola o'zbek tilida gapiryapti. Bugun maktabda o'qituvchim, do'stlarim, onam, dadam bilan. Xursand bo'ldim, xafa bo'ldim, qo'rqaman, urdi, gol urdim, o'yinchoq.");
  form.append('temperature', '0');
  form.append('response_format', 'json');
  try {
    const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}` },
      body: form,
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`Groq STT ${res.status}`);
    return clip((await res.json()).text);
  } catch (e) {
    console.warn('⚠️ Ovozli javob matnga aylantirilmadi:', e.message);
    return null;
  }
}
