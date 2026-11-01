// Multfilm qahramonlari. Har biri bola bilan tayyor savollar asosida suhbatlashadi.
// Rasmlar va obrazlar o'z mualliflariga tegishli (DreamWorks, Disney) — platforma maktab ichida, o'quv maqsadida ishlatiladi.
// Savollar mavzusi: bugungi kun, kayfiyat sababi, maktab, do'stlar, oila, his-tuyg'ular, qobiliyat, orzu.
// Savol { ok, low } ko'rinishida bo'lsa, bolaning bugungi kayfiyatiga qarab tanlanadi (low — 1-2 ball).

export const HEROES = {
  po: {
    name: 'Po',
    emoji: '🐼',
    color: 'sun',
    trait: "Motivatsiya, o'ziga ishonch va qat'iyat",
    hello: { ok: "Salom, do'stim! Men Po — Ajdar jangchisiman 🐼 Sen bilan gaplashishni juda kutgandim!", low: "Salom, do'stim! Men Poman 🐼 Bugun kayfiyating unchalik emas ekan. Kel, birga gaplashamiz, men yoningdaman 🤗" },
    questions: [
      { ok: "Bugun seni eng ko'p nima xursand qildi?", low: 'Bugun seni nima xafa qildi? Menga aytib berasanmi?' },
      "Maktabda bugun qaysi dars senga eng qiziq bo'ldi?",
      "Sinfda eng yaqin do'sting kim? U bilan nima qilishni yaxshi ko'rasan?",
      "Uyda kim bilan ko'proq vaqt o'tkazasan? Birga nima qilasizlar?",
      "Agar biror narsadan xafa bo'lsang, kim bilan gaplashasan?",
      "Men pishiriq yeyishni va kung-fu mashqlarini yaxshi ko'raman 😄 Sen nimani eng yaxshi qila olasan?",
      "Qachon o'zingni kuchli va qahramondek his qilasan?",
      "Katta bo'lganingda kim bo'lishni orzu qilasan?",
    ],
    reactions: ["Voy, zo'r-ku! 🐼", 'Tushundim, rahmat! 🥟', 'Qiziq ekan! Men ham shunday qilardim 😄', "Barakalla, ochiq aytding! 💪", 'Ajoyib javob! ✨', 'Sen haqiqiy qahramonsan! 🌟'],
    bye: "Suhbatimiz uchun rahmat, do'stim! Esingda bo'lsin: maxsus ingrediyent yo'q — hammasi o'zingda! 💪🐼",
  },
  shifu: {
    name: 'Ustoz Shifu',
    emoji: '🥋',
    color: 'grape',
    trait: "Intizom, sabr va o'z ustida ishlash",
    hello: { ok: "Assalomu alaykum, shogirdim. Men Ustoz Shifuman 🥋 Keling, bir oz suhbatlashaylik.", low: "Assalomu alaykum, shogirdim 🥋 Har bir qiyin kundan keyin yaxshi kun keladi. Keling, suhbatlashaylik." },
    questions: [
      { ok: "Bugungi kuningiz qanday o'tdi? Nima yaxshi bo'ldi?", low: 'Bugun kayfiyatingizni nima buzdi? Bemalol aytavering.' },
      "Bugun yangi nimani o'rgandingiz?",
      "Qaysi fan sizga qiyinroq tuyuladi? Uni qanday qilib yengsa bo'ladi deb o'ylaysiz?",
      'Ertalab maktabga qanday tayyorlanasiz? Kim yordam beradi?',
      'Oxirgi marta qachon sabr qilib, biror ishni oxiriga yetkazdingiz?',
      "Sizni nima asabiylashtiradi? Shunda o'zingizni qanday tinchlantirasiz?",
      "Ertaga o'zingizni qaysi tomondan yaxshiroq qilmoqchisiz?",
      "O'n yildan keyin o'zingizni qanday tasavvur qilasiz?",
    ],
    reactions: ['Dono javob 🥋', 'Rahmat, qiziqarli ekan 📜', "Ha, men ham shunday deb o'ylayman 🍑", "Ajoyib! Siz ko'p narsani tushunasiz ✨", 'Yaxshi fikr 🌿', 'Har bir qadam muhim, barakalla! 📚'],
    bye: "Suhbatingiz uchun rahmat, shogirdim. Ichki xotirjamlik — eng katta kuch. Har kuni oz-ozdan o'rganing 🥋",
  },
  judi: {
    name: 'Judi',
    emoji: '🐰',
    color: 'sky',
    trait: 'Maqsad, jasorat va mehnatsevarlik',
    hello: { ok: "Salom! Men Judiman 🐰 Men kichkina quyonman, lekin politsiyachi bo'ldim! Sen bilan tanishgim keldi!", low: "Salom! Men Judiman 🐰 Ba'zan men ham xafa bo'laman. Kel, gaplashib olamiz, yengil tortasan 💙" },
    questions: [
      { ok: 'Bugun nima seni quvontirdi?', low: "Bugun nima bo'ldi? Nima seni xafa qildi?" },
      'Hozir qanday maqsading bor? Nimaga erishmoqchisan?',
      "Maktabda biror narsadan qo'rqqan yoki uyalgan paytlaring bo'ladimi?",
      "Qachon do'stlaringga yordam bergansan?",
      'Uyda senga kim ko\'proq yordam beradi? Unga qanday rahmat aytasan?',
      "Qiyin vaziyatda o'zingga nima deysan?",
      'Senga hamma narsa qila oladigan sehrli kuch berilsa, nima qilarding?',
      "Kelajakda qanday kasb egasi bo'lmoqchisan? Nega aynan shu kasb?",
    ],
    reactions: ["Ura! Zo'r javob! 🐰", 'Rahmat, aytganing uchun 💙', 'Sen juda jasursan! 🥕', 'Qoyil! ✨', 'Tushundim, bu muhim narsa 🌼', 'Men senga ishonaman! 🌟'],
    bye: "Rahmat, do'stim! Esingda bo'lsin: har kim xohlagan narsasiga erisha oladi. Sen buni uddalaysan! 🐰🥕",
  },
  nik: {
    name: 'Nik',
    emoji: '🦊',
    color: 'coral',
    trait: 'Muammolarga turli tomondan qarash',
    hello: { ok: "Hey, salom! Men Nikman 🦊 Menda senga bir nechta qiziq savol bor!", low: "Hey, salom! Men Nikman 🦊 Har qanday muammoning yechimi bor. Kel, birga o'ylab ko'ramiz." },
    questions: [
      { ok: "Bugungi kuningdagi eng qiziq voqea nima bo'ldi?", low: "Bugun nima kayfiyatingni buzdi? Kel, birga o'ylab ko'ramiz." },
      "Maktabda qanday muammo seni qiynayapti? Uni qanday hal qilsa bo'ladi?",
      "Do'sting bilan urishib qolsang, qanday yarashasan?",
      "Uyda oilang bilan nima qilishni eng yaxshi ko'rasan?",
      'Qaysi narsa senga adolatsizdek tuyuladi?',
      'Agar xato qilsang, nima qilasan?',
      "Qaysi topishmoq yoki o'yinni yechishni yaxshi ko'rasan?",
      'Kelajakda qanday narsa ixtiro qilmoqchisan?',
    ],
    reactions: ['Ooo, aqlli javob! 🦊', "Qiziq, buni o'ylab ko'rmagan ekanman 🤔", "Zo'r g'oya! 💡", 'Rahmat, aytib berganing uchun 🍂', "Sen ham menga o'xshab topqir ekansan 😏", 'Ajoyib! ✨'],
    bye: "Rahmat, topqir do'stim! Esingda bo'lsin: har bir muammoga boshqa tomondan qarasang, yechim topiladi 🦊💡",
  },
  olaf: {
    name: 'Olaf',
    emoji: '⛄',
    color: 'mint',
    trait: "Do'stlik, quvonch va mehribonlik",
    hello: { ok: "Salom! Men Olafman ⛄ Men iliq quchoqlarni yaxshi ko'raman! Gaplashamizmi?", low: "Salom! Men Olafman ⛄ Seni bir quchoqlab qo'yay 🤗 Kel, suhbatlashamiz, kayfiyating ko'tariladi!" },
    questions: [
      { ok: 'Bugun nima seni kuldirdi? 😄', low: 'Bugun nima seni xafa qildi? Menga aytsang, yengil tortasan.' },
      "Tanaffusda nima o'ynashni yaxshi ko'rasan?",
      "Yangi do'st topish senga oson yoki qiyinmi?",
      'Dam olish kunlari oilang bilan qayerga borishni xohlaysan?',
      "Seni nima qo'rqitadi? Men issiq quyoshdan biroz qo'rqaman 🙈",
      "Rasm chizish, qo'shiq aytish yoki biror narsa yasash — qaysi biri senga yoqadi?",
      "Qachon o'zingni eng baxtli his qilasan?",
      "Agar bir kunga sehrli qorbola bo'lsang, nima qilarding?",
    ],
    reactions: ["Ha-ha, zo'r! ⛄", 'Voy, qanday ajoyib! 💙', "Rahmat, do'stim! ❄️", "Men ham shuni yaxshi ko'raman! 🎨", 'Tushundim 🤗', 'Sen juda qiziqarli ekansan! ✨'],
    bye: "Rahmat, do'stim! Ba'zi odamlar uchun quchoqlab qo'yishga arziydi — sen ham shulardansan! ⛄🤗",
  },
  shrek: {
    name: 'Shrek',
    emoji: '🧅',
    color: 'peach',
    trait: "O'zini qabul qilish, mehribonlik va kechirimlilik",
    hello: { ok: "Salom! Men Shrekman 🧅 Botqog'imga xush kelibsan! Kel, bir gaplashaylik.", low: "Salom! Men Shrekman 🧅 Tashqaridan qo'rqinchli ko'rinaman, lekin ichimda mehribonman. Kel, nima bo'lganini gaplashamiz." },
    questions: [
      { ok: 'Bugun kim senga yaxshilik qildi?', low: 'Bugun seni nima xafa qildi? Men tinglayman.' },
      'Bugun sen kimgadir yordam berdingmi?',
      "Maktabda seni kimdir xafa qiladimi yoki o'zingni yaxshi his qilasanmi?",
      "Uyda o'zingni qanday his qilasan? Oilangda kimni eng ko'p sog'inasan?",
      'Kimdir seni xafa qilsa, uni kechira olasanmi?',
      "Men piyozga o'xshayman — qatlam-qatlamman 🧅 Sening ichingda boshqalar bilmaydigan qanday yaxshi xislat bor?",
      "Sen uchun eng mehribon odam kim? Nega?",
      "Katta bo'lganingda odamlarga qanday yordam bermoqchisan?",
    ],
    reactions: ['Rahmat, do\'stim 🧅', 'Sen juda mehribon ekansan 💚', 'Tushundim, bu muhim 🤗', 'Qanday yaxshi! 🌿', "Aytganing uchun rahmat, sen yolg'iz emassan 💚", 'Barakalla! 👏'],
    bye: "Rahmat, do'stim! Esingda bo'lsin: sen qandaysan — shundayligingcha zo'rsan 💚🧅",
  },
};

// Avvalgi versiyadagi qahramon id lari (bazadagi eski suhbatlar uchun)
export const LEGACY_IDS = { bambuk: 'po', boyogli: 'shifu', quyonjon: 'judi', tulkivoy: 'nik', ajdarcha: 'olaf', ayiqvoy: 'shrek' };

export const SKIP_REPLY = "Mayli, bu savolni o'tkazib yuboramiz 🙂";
export const ALERT_REPLY = "Buni aytganing juda to'g'ri qilding. Sen yolg'iz emassan 🤗 Ustozing bilan albatta gaplash, u senga yordam beradi.";

// Xavotirli so'zlar: bola zo'ravonlik, qo'rquv yoki o'ziga zarar haqida yozsa, o'qituvchiga darhol xabar boradi.
// So'z boshidan qidiriladi ("uradi" topiladi, "quradi" esa yo'q).
const ALERT_WORDS = [
  'urdi', 'uradi', 'urishadi', 'urishdi', 'kaltak',
  "qo'rqaman", "qo'rqyapman", "qo'rqitadi", "qo'rqitdi",
  "o'ldir", "o'lgim", "o'lib qol", 'yashagim kelmay', "o'zimga zarar", 'jonimga qasd',
  'hech kim yaxshi ko\'rmay', "hech kimga keraksiz", "yolg'izman", 'yolg\'iz qoldim',
  'haqorat', 'masxara', 'tegishadi', 'kamsit', 'zo\'rla', 'qamab',
  'ochman', "ovqat yo'q", 'yig\'layman', 'yig\'layapman',
  'урди', 'уради', 'уриш', 'қўрқаман', 'ўлдир', 'ўлгим', 'ёлғизман', 'ҳақорат',
];
const norm = (s) => String(s || '').toLowerCase().replace(/[ʻʼ’‘`´]/g, "'");
const ALERT_RE = new RegExp(`(?<![\\p{L}'])(${ALERT_WORDS.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'u');

export const isAlarming = (text) => ALERT_RE.test(norm(text));

export const questionText = (hero, step, mood) => {
  const qn = HEROES[hero].questions[step];
  return typeof qn === 'string' ? qn : mood <= 2 ? qn.low : qn.ok;
};

// Frontend va botga ko'rsatiladigan qisqa ma'lumot (savollarsiz)
export const heroCard = (id) => {
  const h = HEROES[id];
  return h ? { id, name: h.name, emoji: h.emoji, color: h.color, trait: h.trait, image: `/heroes/${id}.jpg` } : null;
};
export const heroList = () => Object.keys(HEROES).map(heroCard);
