# 🌈 Kamalak

**Boshlang'ich sinflarda o'quvchilarning shaxsiy rivojlanishini qo'llab-quvvatlash platformasi**

O'quvchi va o'qituvchi uchun veb-sayt + Telegram bot. Ikkalasi bitta bazadan foydalanadi: saytda ro'yxatdan o'tgan foydalanuvchi botga shu login va parol bilan kiradi.

| Qism | Texnologiya |
|---|---|
| Frontend | React 18 + Vite (`frontend/`) |
| Backend | Express + MongoDB (`mongodb` drayveri) (`backend/`) |
| Bot | Telegraf, Express serveri bilan bitta jarayonda (`backend/src/bot.js`) |

## Imkoniyatlar

**Qahramon bilan suhbat:** o'quvchi avval kayfiyatini belgilaydi, keyin 13 ta qahramondan birini tanlaydi (🐼 Po, 🥋 Ustoz Shifu, 🐰 Judi, 🦊 Nik, ⛄ Olaf, 🧅 Shrek, 🛻 Meyter, 💧 Ueyd, 🔥 Ember, 😬 Xavotir, 😡 Jahl, 🦁 Aleks, 🦋 Mirabel). Rasmlar `frontend/public/heroes/` papkasida; obrazlar DreamWorks, Disney va Pixar'ga tegishli, shuning uchun platforma maktab ichida ishlatilishi kerak. Qahramon 8 ta savol beradi: bugungi kun, kayfiyat sababi, maktab, do'stlar, oila, his-tuyg'ular, qobiliyat va orzular haqida. Birinchi savol bolaning kayfiyatiga moslashadi. Keyingi savollarni AI (avval Gemini, u ishlamasa Groq) bolaning javoblariga qarab, shu mavzular doirasida tuzadi; kalit berilmagan yoki AI javob bermagan bo'lsa, tayyor savollar beriladi. Xavotirli javobdan keyin AI chaqirilmaydi. Javoblarni faqat o'z o'qituvchisi ko'radi. Zo'ravonlik, qo'rquv yoki o'ziga zarar haqidagi so'zlar topilsa, o'qituvchiga Telegramda darhol 🔴 ogohlantirish boradi. Savollar va xavotirli so'zlar ro'yxati `backend/src/heroes.js` faylida.

**O'quvchi:** kunlik kayfiyat kundaligi (izoh bilan) · shaxsiy maqsadlar va foiz bilan bajarilishi · «Men qandayman?»: 5 ta sifat bo'yicha o'zini baholash, natija diagrammada ko'rinadi · topshiriqlarni bajarish va yulduz yig'ish · nishonlar va darajalar.

**O'qituvchi:** sinf yaratish va sinf kodi · har bir o'quvchining bugungi kayfiyati · o'quvchi profili: kayfiyat kalendari, sifatlar dinamikasi, maqsadlar, vazifalar · nishon berish · yopiq kuzatuv qaydlari · topshiriq berish, javoblarni baholash · 💬 Suhbatlar: o'quvchilarning qahramonlar bilan suhbatdagi javoblari, xavotirlilarini alohida ko'rish · sinf tahlili: haftalik kayfiyat xaritasi, o'rtacha sifatlar, e'tibor talab qiladigan o'quvchilar, pedagogik tavsiya.

**Telegram bot:** `/start` bosilganda login, keyin parol so'raladi (parol yozilgan xabar o'chiriladi). Bir marta kirgan foydalanuvchidan qayta so'ralmaydi.
- O'quvchi menyusi: 💬 Qahramon bilan suhbat · 😊 Kayfiyatim · 📋 Vazifalarim (✅ Bajardim tugmasi bilan) · 🎯 Maqsadlarim · 🏆 Yutuqlarim · 🚪 Chiqish
- O'qituvchi menyusi: 👩‍🏫 Sinfim · 📊 Bugungi holat · 📋 Topshiriqlar · 🚪 Chiqish
- Bildirishnomalar: o'quvchi kayfiyatini «Xafa» yoki «Tashvishli» deb belgilasa, o'qituvchiga xabar boradi. O'quvchi qahramon bilan suhbatni tugatsa, o'qituvchiga uning javoblari yuboriladi; xavotirli javob esa darhol 🔴 bilan yuboriladi. Yangi topshiriq berilsa, nishon berilsa yoki javob baholansa, o'quvchiga xabar boradi.

## Ishga tushirish

MongoDB ishlab turishi kerak (mahalliy server yoki MongoDB Atlas). Manzil `backend/.env` faylida beriladi:
```
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=kamalak
```

```bash
npm run install:all     # paketlarni o'rnatish
npm run build           # frontendni build qilish
npm run seed            # (ixtiyoriy) demo ma'lumotlar
npm start               # http://localhost:7000
```

Demo akkauntlar (`npm run seed` dan keyin):
- O'qituvchi: `ustoz` / `ustoz123`
- O'quvchilar: `ali`, `malika`, `jasur`, `zarina`, `bobur`, `nilufar` / `123456`

### AI savollarni yoqish (bepul)
`backend/.env` fayliga bitta yoki ikkala kalitni yozing:
```
GEMINI_API_KEY=...   # https://aistudio.google.com/apikey
GROQ_API_KEY=...     # https://console.groq.com/keys
```
Model nomini `GEMINI_MODEL` / `GROQ_MODEL` bilan o'zgartirish mumkin (standart: `gemini-3.6-flash`, `openai/gpt-oss-120b`).

### Telegram botni yoqish
1. Telegramda [@BotFather](https://t.me/BotFather) → `/newbot` → token oling.
2. `backend/.env` faylida `BOT_TOKEN=` ga tokenni, `BOT_USERNAME=` ga bot nomini (`@` belgisisiz) yozing.
3. `npm start` — konsolda `🤖 Telegram bot ishga tushdi` chiqadi.

> Bitta token bilan faqat bitta dastur ishlay oladi. Boshqa joyda ishlatilayotgan bot tokenini bermang.

### Dasturlash rejimi
```bash
npm run dev:backend     # :7000, o'zgarishda qayta ishga tushadi
npm run dev:frontend    # :5173, /api so'rovlari :7000 ga yo'naltiriladi
```

### Testlar
```bash
npm test    # API (10 ta) + bot (10 ta) testlari, MongoDB'da vaqtinchalik bazada ishlaydi va oxirida o'chiriladi
```

### Eski SQLite bazasidan ko'chirish
Oldingi versiya ma'lumotlari `backend/data/kamalak.db` faylida edi. Ularni MongoDB'ga bir marta ko'chirish uchun (id lar, parollar va Telegram ulanishlari saqlanadi):
```bash
npm run migrate --prefix backend
```

## Tezlik
- Har bir sahifa alohida yuklanadi (lazy loading). Boshlang'ich JS hajmi ~62 KB gzip.
- API javoblari keshlanadi: oldin ochilgan sahifaga qaytganda ma'lumot darhol ko'rinadi, keyin fonda yangilanadi.
- MongoDB'da kerakli indekslar server ishga tushganda avtomatik yaratiladi, bir sahifa uchun kerakli so'rovlar parallel bajariladi. Javoblar gzip bilan siqiladi.
