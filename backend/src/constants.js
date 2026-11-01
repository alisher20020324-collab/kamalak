// Shaxsiy rivojlanishning 5 ta asosiy sifati (o'zini baholash, maqsad va topshiriqlar shu bo'yicha)
export const QUALITIES = {
  mustaqillik: { title: 'Mustaqillik', emoji: '🦁', hint: "Ishni o'zim boshlayman va oxiriga yetkazaman" },
  masuliyat: { title: "Mas'uliyat", emoji: '🐢', hint: "Va'damni bajaraman, vazifalarimni unutmayman" },
  hamkorlik: { title: 'Hamkorlik', emoji: '🐬', hint: "Do'stlarim bilan birga ishlayman, yordam beraman" },
  ijodkorlik: { title: 'Ijodkorlik', emoji: '🦋', hint: "Yangi g'oyalar o'ylab topaman" },
  qiziquvchanlik: { title: 'Qiziquvchanlik', emoji: '🦉', hint: "Savol beraman, yangi narsalarni o'rganaman" },
};

export const MOODS = {
  1: { emoji: '😢', title: 'Xafa' },
  2: { emoji: '😟', title: 'Tashvishli' },
  3: { emoji: '😐', title: 'Oddiy' },
  4: { emoji: '🙂', title: 'Yaxshi' },
  5: { emoji: '😄', title: 'Juda zo\'r' },
};

export const BADGES = {
  yulduz: { emoji: '⭐', title: 'Yulduzcha' },
  dost: { emoji: '🤝', title: "Yaxshi do'st" },
  ijodkor: { emoji: '🎨', title: 'Ijodkor' },
  mehnatkash: { emoji: '💪', title: 'Mehnatsevar' },
  kitobxon: { emoji: '📚', title: 'Kitobxon' },
  yordamchi: { emoji: '🤗', title: 'Yordamchi' },
  topqir: { emoji: '💡', title: 'Topqir' },
  jasur: { emoji: '🦸', title: 'Jasur' },
};

export const AVATARS = ['🦊', '🐼', '🐯', '🐰', '🐨', '🦁', '🐸', '🐵', '🦄', '🐧', '🐻', '🐱'];

// Sana O'zbekiston vaqti bo'yicha (UTC+5)
export function today(offsetDays = 0) {
  const d = new Date(Date.now() + 5 * 3600 * 1000 + offsetDays * 86400 * 1000);
  return d.toISOString().slice(0, 10);
}
