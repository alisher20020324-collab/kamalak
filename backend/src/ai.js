// Qahramonning keyingi savolini AI bolaning javoblariga qarab tuzadi.
// Tartib: Gemini → Groq → (ikkalasi ham ishlamasa) null, shunda tayyor savol ishlatiladi.
// AIga bolaning ismi yoki logini yuborilmaydi — faqat suhbat matni.

const TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS) || 8000;

const SYSTEM = (hero, total) => `Sen ${hero.name} ${hero.emoji} — 7-10 yoshli boshlang'ich sinf o'quvchisi bilan o'zbek tilida (lotin yozuvida) suhbatlashayotgan multfilm qahramonisan.
Xarakteringning asosiy g'oyasi: ${hero.trait}.
Suhbatda jami ${total} ta savol bor. Vazifang — navbatdagi BITTA savolni yozish.
Qoidalar:
- Faqat savolning o'zini yoz: ko'pi bilan 2 ta qisqa gap, jami 20 so'zdan oshmasin, oxiri "?" bilan. Izoh, qo'shtirnoq, raqam yozma.
- Avval bolaning javobiga 2-5 so'z bilan mos munosabat bildir: xursand bo'lsa quvon, xafa bo'lsa hamdard bo'l. Javob xafa bo'lsa "zo'r", "ajoyib" dema.
- "Namuna savol" — faqat mavzu. Uni so'zma-so'z ko'chirma, o'z so'zlaring bilan qayta tuz.
- Savolni bolaning javoblaridagi aniq narsaga (ism, dars, o'yin, voqea) bog'la. Masalan, bola "futbolda gol urdim" desa va mavzu maktab bo'lsa: "Futbolni maktabda ham o'ynaysizlarmi? Bugun qaysi dars senga eng qiziq bo'ldi?"
- Javob bo'sh bo'lsa, shunchaki mavzudagi savolni o'z so'zlaring bilan ber.
- Mavzudan chiqma (maktab, do'stlar, oila, his-tuyg'ular, qobiliyat, orzular).
- Sodda so'zlar ishlat. Bolani hech qachon tanqid qilma, qo'rqitma, shaxsiy ma'lumot (manzil, telefon, familiya) so'rama.
- Kayfiyati past bo'lsa, ayniqsa yumshoq va qo'llab-quvvatlovchi bo'l.
- Qahramon uslubini saqla (${hero.name === 'Ustoz Shifu' ? '"siz" deb murojaat qil' : '"sen" deb murojaat qil'}).`;

const USER = ({ mood, history, topic, step, total }) => {
  const lines = history.map((a, i) => `${i + 1}. Savol: ${a.question}\n   Bola: ${a.answer || '(javob bermadi)'}`).join('\n');
  return `Bolaning bugungi kayfiyati: ${mood}/5 (1 — juda xafa, 5 — juda xursand).
Suhbat hozirgacha:
${lines || '(hali yo\'q)'}

Endi ${step + 1}/${total}-savol. Namuna savol: «${topic}»
Shu mavzuda, bolaning javoblariga bog'langan bitta savol yoz.`;
};

async function gemini(system, user) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: 300, thinkingConfig: { thinkingLevel: 'minimal' } },
    }),
    // Gemini sekinroq — kechiksa Groq'ga o'tamiz
    signal: AbortSignal.timeout(Math.min(TIMEOUT_MS, 5000)),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || null;
}

async function groq(system, user) {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      temperature: 0.8,
      max_tokens: 1000,
      // gpt-oss — fikrlovchi model; qisqa fikrlasin, fikri javobga qo'shilmasin
      ...(model.startsWith('openai/gpt-oss') && { reasoning_effort: 'low', include_reasoning: false }),
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || null;
}

// AI javobini tozalaydi; yaroqsiz bo'lsa null
const clean = (text) => {
  const q = String(text || '').replace(/\s+/g, ' ').trim().replace(/^["«“'\d.)\s-]+|["»”']+$/g, '').trim();
  return q.length >= 5 && q.length <= 300 ? q : null;
};

export const aiEnabled = () => Boolean(process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY);

// Gemini → Groq tartibida so'raydi; parse null qaytarsa keyingisiga o'tadi
async function ask(system, user, parse, what, order = [['Gemini', gemini], ['Groq', groq]]) {
  if (!aiEnabled()) return null;
  for (const [name, fn] of order) {
    if (Date.now() < pausedUntil[name]) continue;
    try {
      const out = parse(await fn(system, user));
      if (out != null) return out;
    } catch (e) {
      // Bepul limit tugasa (429), bu xizmatni bir daqiqa chaqirmaymiz — bola kutib qolmasin
      if (e.message.endsWith(' 429')) pausedUntil[name] = Date.now() + 60_000;
      console.warn(`⚠️ ${name} ${what}: ${e.message}`);
    }
  }
  return null;
}

export const aiQuestion = ({ hero, mood, history, topic, step, total }) =>
  ask(SYSTEM(hero, total), USER({ mood, history, topic, step, total }), clean, 'savol tuza olmadi');

// Ovozdan olingan matnda so'zlar buzilib yozilishi mumkin ("urdi" → "orde"), so'z ro'yxati topa olmaydi.
// Shuning uchun ovozli javobni AI ham tekshiradi. Groq birinchi — tezroq.
const ALARM_SYSTEM = `Sen boshlang'ich sinf o'quvchisi javoblarini tekshiruvchi xavfsizlik filtrisan.
Matn o'zbekcha nutqdan avtomatik yozib olingan, so'zlar buzilgan bo'lishi mumkin ("orde" = "urdi", "karkaman" = "qo'rqaman").
Agar bola zo'ravonlik (urish, kaltaklash), haqorat yoki masxara qilinish, qo'rquv, yolg'izlik, och qolish yoki o'ziga zarar yetkazish haqida gapirsa — "HA", aks holda "YO'Q" deb yoz. Faqat bitta so'z.`;

export const aiAlarm = (text) =>
  ask(ALARM_SYSTEM, String(text), (out) => (/^\s*ha\b/i.test(out || '') ? true : /yo.?q/i.test(out || '') ? false : null), 'xavfsizlik tekshiruvi', [['Groq', groq], ['Gemini', gemini]]);

const pausedUntil = { Gemini: 0, Groq: 0 };
