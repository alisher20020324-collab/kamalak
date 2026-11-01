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

// Bolaning ovozli xabarini matnga aylantiradi; tushunilmasa null
export async function transcribe(buffer, mime = 'audio/ogg') {
  const key = process.env.GROQ_API_KEY;
  if (!key || !buffer?.length) return null;
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
    const text = String((await res.json()).text || '').trim();
    return text.length >= 2 ? text.slice(0, 500) : null;
  } catch (e) {
    console.warn('⚠️ Ovozli javob matnga aylantirilmadi:', e.message);
    return null;
  }
}
