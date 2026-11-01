// Multfilm qahramonlari. Birinchi savol tayyor; keyingilarini AI (ai.js) bolaning javoblariga qarab shu mavzularda tuzadi, AI ishlamasa tayyor savollar ishlatiladi.
// Rasmlar va obrazlar o'z mualliflariga tegishli (DreamWorks, Disney, Pixar) — platforma maktab ichida, o'quv maqsadida ishlatiladi.
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
  mater: {
    name: 'Meyter',
    emoji: '🛻',
    color: 'peach',
    trait: "Sadoqatli do'stlik va o'zingdek bo'lish",
    hello: { ok: "Salom, do'stim! Men Meyterman 🛻 Eng zo'r shatakchi mashina! Kel, bir gurunglashaylik!", low: "Salom, do'stim! Men Meyterman 🛻 Bugun kayfiyating yo'qmi? Hechqisi yo'q, do'stlar shunday paytda kerak. Kel, gaplashamiz." },
    questions: [
      { ok: 'Bugun seni nima kuldirdi?', low: "Bugun nima bo'ldi? Seni nima xafa qildi?" },
      "Maktabga qanday borasan? Yo'lda nimalarni ko'rasan?",
      "Eng yaqin do'sting kim? U senga qanday yordam beradi?",
      'Uyda kattalar bilan birga nima qilishni yaxshi ko\'rasan?',
      "Kimdir sen ustingdan kulsa, o'zingni qanday his qilasan?",
      "Men orqaga yurishda chempionman 😄 Sen qaysi ishni hammadan yaxshi qilasan?",
      "Do'sting xafa bo'lsa, uning kayfiyatini qanday ko'tarasan?",
      "Agar sening ham g'ildiraklaring bo'lsa, qayerlarga sayohat qilarding?",
    ],
    reactions: ["Ha-ha, zo'r-ku! 🛻", "Rahmat, do'stim! 🔧", 'Qoyil! Sen menga yoqding 😄', 'Tushundim, bu muhim 🤗', 'Mana bu gap! 👍', "Sen haqiqiy do'stsan! 🌟"],
    bye: "Rahmat, do'stim! Esingda bo'lsin: haqiqiy do'st seni qanday bo'lsang, shundayligingcha yaxshi ko'radi 🛻💛",
  },
  wade: {
    name: 'Ueyd',
    emoji: '💧',
    color: 'sky',
    trait: "His-tuyg'ularni ochiq aytish va hamdardlik",
    hello: { ok: "Salom! Men Ueydman 💧 Men suvdan yaralganman va tez-tez yig'lab yuboraman 😅 Kel, gaplashamiz!", low: "Salom! Men Ueydman 💧 Xafa bo'lish — bu normal holat, men ham ko'p yig'layman. Kel, dardlashamiz 💙" },
    questions: [
      { ok: 'Bugun seni nima xursand qildi?', low: 'Bugun seni nima xafa qildi? Bemalol ayt, men tinglayman.' },
      "Bugun maktabda o'zingni qanday his qilding: quvnoq, charchagan yoki boshqacha?",
      "Qachon oxirgi marta ko'zing yoshlangan? Nima bo'lgan edi?",
      "Xafa bo'lganingda seni kim quchoqlab, yupatadi?",
      "Sinfingda kimdir xafa bo'lsa, buni qanday sezasan?",
      'Seni nima ta\'sirlantiradi: musiqa, multfilm yoki chiroyli manzara?',
      "Qaysi ishni qilganingda o'zingni xotirjam his qilasan?",
      "Katta bo'lganingda odamlarga qanday yaxshilik qilmoqchisan?",
    ],
    reactions: ["Voy, juda ta'sirli 💧", 'Rahmat, ochiq aytganing uchun 💙', 'Seni juda yaxshi tushunaman 🤗', 'Qanday yaxshi! 🌊', 'Bu juda muhim gap ✨', 'Sen mehribon ekansan 💙'],
    bye: "Rahmat, do'stim! Esingda bo'lsin: his-tuyg'ularingni aytish — bu kuchsizlik emas, jasorat 💧💙",
  },
  ember: {
    name: 'Ember',
    emoji: '🔥',
    color: 'coral',
    trait: "Jahlni boshqarish va o'z yo'lini topish",
    hello: { ok: "Salom! Men Emberman 🔥 Ichimda olov yonib turadi! Kel, bir suhbatlashaylik.", low: "Salom! Men Emberman 🔥 Ba'zan men ham alangalanib ketaman yoki xafa bo'laman. Kel, gaplashsak yengil tortasan." },
    questions: [
      { ok: 'Bugun seni nima quvontirdi?', low: 'Bugun nima kayfiyatingni buzdi? Menga ayt.' },
      "Maktabda qaysi ishni qilganingda o'zingni kuchli his qilasan?",
      'Qachon jahling chiqadi? Shunda nima qilasan?',
      'Jahling chiqqanda tinchlanishga nima yordam beradi?',
      'Oilang sendan nimani kutadi? Sen o\'zing nimani xohlaysan?',
      "Senga o'xshamaydigan biror kishi bilan do'stlashganmisan? U qanday?",
      "Qaysi ishni shunchalik yaxshi ko'rasanki, soatlab qila olasan?",
      "Katta bo'lganingda qanday orzuingni amalga oshirmoqchisan?",
    ],
    reactions: ["Zo'r, olovli javob! 🔥", 'Rahmat, aytganing uchun 🧡', 'Tushundim, bu muhim ✨', 'Voy, qiziq ekan! 🔥', 'Sen kuchlisan! 💪', 'Barakalla! 🌟'],
    bye: "Rahmat, do'stim! Esingda bo'lsin: ichingdagi olovni to'g'ri yo'naltirsang, u seni oldinga yetaklaydi 🔥🧡",
  },
  anxiety: {
    name: 'Xavotir',
    emoji: '😬',
    color: 'sun',
    trait: 'Hayajon va xavotirni yengish',
    hello: { ok: "Salom-salom! Men Xavotirman 😬 Hamma narsani oldindan rejalashtiraman! Kel, gaplashamiz!", low: "Salom! Men Xavotirman 😬 Ichingda nimadir bezovta qilyaptimi? Menga tanish tuyg'u. Kel, birga tinchlanamiz 🤗" },
    questions: [
      { ok: 'Bugun seni nima xursand qildi?', low: 'Bugun seni nima bezovta qildi?' },
      'Maktabda qachon hayajonlanasan? Masalan, doska oldiga chiqqandami?',
      "Ertangi kunni o'ylab, uxlolmay qolgan paytlaring bo'lganmi?",
      'Hayajonlanganingda tinchlanishga nima yordam beradi?',
      'Xavotirlanganingda kimga aytasan?',
      "Qaysi ishni avval qiyin deb o'ylab, keyin uddalagansan?",
      "Ko'nglingni tinchlantiradigan sevimli joying yoki narsang bormi?",
      'Kelajakda nimani albatta uddalamoqchisan?',
    ],
    reactions: ['Uf, aytganing yaxshi bo\'ldi! 😬', 'Tushundim, chuqur nafas olamiz 🌬', 'Sen jasur ekansan! 💪', 'Qoyil! ✨', "Mana ko'rdingmi, hammasi joyida 🤗", 'Ajoyib javob! 🌟'],
    bye: "Rahmat, do'stim! Esingda bo'lsin: hayajonlanish — normal. Chuqur nafas ol, sen hammasini uddalaysan 😬💛",
  },
  anger: {
    name: 'Jahl',
    emoji: '😡',
    color: 'coral',
    trait: "Jahlni tushunish va uni to'g'ri boshqarish",
    hello: { ok: "Salom! Men Jahlman 😡 Qo'rqma, bugun kayfiyatim yaxshi! Kel, gaplashamiz.", low: "Salom! Men Jahlman 😡 Biror narsa jahlingni chiqardimi? Kel, buni birga hal qilamiz." },
    questions: [
      { ok: 'Bugun seni nima xursand qildi?', low: 'Bugun nima jahlingni chiqardi yoki seni xafa qildi?' },
      'Maktabda nima seni asabiylashtiradi?',
      'Jahling chiqqanda tanangda nimani sezasan: yuzing qizaradimi, mushtlaring tugiladimi?',
      'Jahling chiqqanda nima qilsang, tezroq tinchlanasan?',
      "Do'sting bilan janjallashib qolsang, qanday yarashasan?",
      'Uyda nima jahlingni chiqaradi? Bu haqda kimga aytasan?',
      'Qaysi narsa senga adolatsizdek tuyuladi?',
      'Jahling chiqqanda atrofingdagilar nima qilishini xohlaysan?',
    ],
    reactions: ['Hmm, tushundim! 😡', 'Rahmat, ochiq aytding 👍', "Bu juda to'g'ri fikr! 🔥", 'Qoyil, sen aqllisan! ✨', 'Mana bu gap! 💪', 'Yaxshi javob! 🌟'],
    bye: "Rahmat, do'stim! Esingda bo'lsin: jahl chiqishi normal, muhimi — avval 10 gacha sanab, keyin gapirish 😡➡️😊",
  },
  alex: {
    name: 'Aleks',
    emoji: '🦁',
    color: 'sun',
    trait: "O'ziga ishonch, iste'dod va do'stlarni qadrlash",
    hello: { ok: "Salom! Men Aleksman 🦁 Nyu-York hayvonot bog'ining yulduzi! Kel, gaplashamiz!", low: "Salom! Men Aleksman 🦁 Ba'zan sherlar ham xafa bo'ladi. Kel, gaplashsak, kayfiyating ko'tariladi!" },
    questions: [
      { ok: "Bugun eng zo'r lahzang qaysi bo'ldi?", low: 'Bugun nima seni xafa qildi? Menga aytib berasanmi?' },
      "Maktabda qachon o'zingni yulduzdek his qilasan?",
      "Men raqsga tushishni yaxshi ko'raman 💃 Sening qanday iste'doding bor?",
      "Eng yaqin do'stlaring kimlar? Ular bilan nima qilasizlar?",
      "Uydan uzoqda bo'lsang, nimani eng ko'p sog'inasan?",
      "Yangi odamlar bilan tanishganingda o'zingni qanday his qilasan?",
      'Hamma seni olqishlasa, qaysi ishing uchun olqishlashlarini xohlarding?',
      'Agar sayohatga chiqsang, qaysi mamlakatga borarding?',
    ],
    reactions: ['Ajoyib! Sen yulduzsan! 🌟', "Rahmat, do'stim! 🦁", "Voy, zo'r-ku! 💃", 'Tushundim 🤗', 'Qoyil, qoyil! 👏', 'Mana bu gap! 🎉'],
    bye: "Rahmat, do'stim! Esingda bo'lsin: haqiqiy yulduz — do'stlarini qadrlaydigan kishi 🦁🌟",
  },
  mirabel: {
    name: 'Mirabel',
    emoji: '🦋',
    color: 'grape',
    trait: "Har kim o'zicha qadrli, oila va mehr",
    hello: { ok: "Salom! Men Mirabelman 🦋 Sehrli kuchim yo'q, lekin baribir o'zimcha maxsusman! Sen ham shundaysan. Kel, gaplashamiz!", low: "Salom! Men Mirabelman 🦋 Ba'zan men ham o'zimni boshqalardan kam his qilganman. Kel, gaplashamiz, sen yolg'iz emassan 💜" },
    questions: [
      { ok: 'Bugun nima seni quvontirdi?', low: 'Bugun nima seni xafa qildi? Menga aytib ber.' },
      "Maktabda qachon o'zingni boshqalardan farqli his qilasan?",
      'Oilangda har kimning o\'z xususiyati bor. Sen oilangda qandaysan?',
      "Oilang bilan birga qilgan eng yoqimli ishing nima?",
      "Qachon o'zingni boshqalardan kam his qilgansan? Shunda nima yordam berdi?",
      "Sehrli kuchsiz ham qila oladigan ajoyib ishing nima?",
      "Do'stlaringni nimasi uchun yaxshi ko'rasan?",
      'Agar bitta sehrli kuch tanlay olsang, qaysi birini tanlarding va nega?',
    ],
    reactions: ['Voy, ajoyib! 🦋', 'Rahmat, aytganing uchun 💜', 'Sen juda maxsussan! ✨', 'Tushundim 🤗', 'Qanday chiroyli! 🌸', 'Barakalla! 🌟'],
    bye: "Rahmat, do'stim! Esingda bo'lsin: sehrli kuching bo'lmasa ham, sen o'zingcha ajoyibsan 🦋💜",
  },
};

// Avvalgi versiyadagi qahramon id lari (bazadagi eski suhbatlar uchun)
// Qahramonlar ovozi: bepul o'zbekcha ovozlar, har biriga o'z balandligi (pitch) va tezligi (rate)
const SARDOR = 'uz-UZ-SardorNeural';
const MADINA = 'uz-UZ-MadinaNeural';
export const VOICES = {
  po: { name: SARDOR, pitch: '-5Hz', rate: '+8%' },
  shifu: { name: SARDOR, pitch: '-12Hz', rate: '-15%' },
  judi: { name: MADINA, pitch: '+10Hz', rate: '+8%' },
  nik: { name: SARDOR, pitch: '+4Hz', rate: '-3%' },
  olaf: { name: SARDOR, pitch: '+25Hz', rate: '+10%' },
  shrek: { name: SARDOR, pitch: '-25Hz', rate: '-8%' },
  mater: { name: SARDOR, pitch: '-8Hz', rate: '+12%' },
  wade: { name: SARDOR, pitch: '+12Hz', rate: '-5%' },
  ember: { name: MADINA, pitch: '-6Hz', rate: '+5%' },
  anxiety: { name: MADINA, pitch: '+15Hz', rate: '+22%' },
  anger: { name: SARDOR, pitch: '-30Hz', rate: '+10%' },
  alex: { name: SARDOR, pitch: '-4Hz', rate: '+5%' },
  mirabel: { name: MADINA, pitch: '+5Hz', rate: '+5%' },
};

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
