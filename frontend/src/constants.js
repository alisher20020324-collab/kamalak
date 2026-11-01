// Backenddagi backend/src/constants.js bilan bir xil
export const QUALITIES = {
  mustaqillik: { title: 'Mustaqillik', emoji: '🦁', color: 'sun', hint: "Ishni o'zim boshlayman va oxiriga yetkazaman" },
  masuliyat: { title: "Mas'uliyat", emoji: '🐢', color: 'mint', hint: "Va'damni bajaraman, vazifalarimni unutmayman" },
  hamkorlik: { title: 'Hamkorlik', emoji: '🐬', color: 'sky', hint: "Do'stlarim bilan birga ishlayman, yordam beraman" },
  ijodkorlik: { title: 'Ijodkorlik', emoji: '🦋', color: 'grape', hint: "Yangi g'oyalar o'ylab topaman" },
  qiziquvchanlik: { title: 'Qiziquvchanlik', emoji: '🦉', color: 'coral', hint: "Savol beraman, yangi narsalarni o'rganaman" },
};

export const MOODS = {
  1: { emoji: '😢', title: 'Xafa', color: '#8fa3ff' },
  2: { emoji: '😟', title: 'Tashvishli', color: '#b89cff' },
  3: { emoji: '😐', title: 'Oddiy', color: '#ffd166' },
  4: { emoji: '🙂', title: 'Yaxshi', color: '#7bdcb5' },
  5: { emoji: '😄', title: "Juda zo'r", color: '#2ec4b6' },
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

const WEEKDAYS = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];
const MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
export const weekday = (day) => WEEKDAYS[new Date(day + 'T00:00:00').getDay()];
export const prettyDate = (day) => {
  const d = new Date(day.slice(0, 10) + 'T00:00:00');
  return `${d.getDate()}-${MONTHS[d.getMonth()]}`;
};

// O'zbekiston vaqti bo'yicha sana (UTC+5)
export function today(offset = 0) {
  return new Date(Date.now() + 5 * 3600e3 + offset * 86400e3).toISOString().slice(0, 10);
}

export function greeting() {
  const h = new Date(Date.now() + 5 * 3600e3).getUTCHours();
  if (h < 11) return 'Xayrli tong';
  if (h < 17) return 'Xayrli kun';
  return 'Xayrli kech';
}
