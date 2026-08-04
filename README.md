# 🎮 משחקי יום הגיבוש

אתר משחקים ליום גיבוש החברה – חמישה משחקים בעברית, RTL מלא, Mobile First, ללא הרשמה.

---

## 📁 מבנה הפרויקט

```
game-day/
├── data/                        ← ✏️  ערכו רק את הקבצים כאן!
│   ├── connections.json         (מה הקשר – 16 מילים, 4 קבוצות)
│   ├── logic.json               (הגיונית – שאלה + תשובות + רמזים)
│   ├── chain.json               (השרשרת – התחלה, סוף, חוליות)
│   ├── songs.json               (איזה שיר – תיאור + תשובות)
│   └── whoami.json              (מי אני – דמות + רמזים בהדרגה)
├── public/
│   └── logo.png                 ← 🖼️  החליפו את הלוגו כאן
├── src/
│   ├── app/                     (Next.js App Router)
│   │   ├── layout.tsx
│   │   ├── page.tsx             (דף בית)
│   │   ├── globals.css
│   │   ├── connections/page.tsx
│   │   ├── logic/page.tsx
│   │   ├── chain/page.tsx
│   │   ├── which-song/page.tsx
│   │   └── who-am-i/page.tsx
│   ├── components/
│   │   ├── games/               (לוגיקת המשחקים)
│   │   │   ├── ConnectionsGame.tsx
│   │   │   ├── LogicGame.tsx
│   │   │   ├── ChainGame.tsx
│   │   │   ├── WhichSongGame.tsx
│   │   │   └── WhoAmIGame.tsx
│   │   └── ui/                  (קומפוננטים משותפים)
│   │       ├── Header.tsx
│   │       ├── ScoreBar.tsx
│   │       ├── ShareButton.tsx
│   │       ├── HintButton.tsx
│   │       ├── GameResult.tsx
│   │       └── GamePageWrapper.tsx
│   ├── lib/
│   │   ├── games.ts             (מטא-דאטה של המשחקים)
│   │   └── storage.ts           (localStorage + ניקוד)
│   └── types/index.ts           (TypeScript types)
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── .eslintrc.json
```

---

## 🚀 התקנה והפעלה

### דרישות מקדימות
- [Node.js 18+](https://nodejs.org)

### שלבים

```bash
# 1. כנסו לתיקייה
cd game-day

# 2. התקינו תלויות
npm install

# 3. הפעילו שרת פיתוח
npm run dev
```

פתחו: **http://localhost:3000**

---

## ✏️ עריכת תוכן המשחקים

**ערכו רק את קבצי `/data/*.json` – אין צורך לגעת בקוד!**

### מה הקשר (`data/connections.json`)
```json
{
  "attempts": 5,
  "groups": [
    {
      "title": "שם הקבוצה",
      "difficulty": "easy",
      "hint": "רמז לקבוצה",
      "words": ["מילה1", "מילה2", "מילה3", "מילה4"]
    }
  ]
}
```
- `difficulty`: `easy` / `medium` / `hard` / `expert`
- חייבות להיות בדיוק **4 קבוצות** עם **4 מילים** כל אחת

### הגיונית (`data/logic.json`)
```json
{
  "question": "טקסט החידה",
  "answers": ["תשובה1", "תשובה2"],
  "hints": ["רמז ראשון", "רמז שני"],
  "explanation": "הסבר לאחר פתרון"
}
```

### השרשרת (`data/chain.json`)
```json
{
  "start": "מילת התחלה",
  "end": "מילת סיום",
  "links": [
    { "answer": "חוליה1", "hint": "רמז" }
  ]
}
```

### איזה שיר (`data/songs.json`)
```json
{
  "prompt": "תיאור השיר (ללא מילות השיר)",
  "answers": ["שם השיר", "גרסה נוספת"],
  "artist": "שם האמן",
  "hints": ["רמז 1", "רמז 2"]
}
```

### מי אני (`data/whoami.json`)
```json
{
  "answer": "שם הדמות",
  "acceptedAnswers": ["גרסה1", "גרסה2"],
  "clues": ["רמז קשה", "רמז בינוני", "רמז קל"]
}
```

---

## 🖼️ החלפת לוגו

1. הכינו קובץ `logo.png` (80×80 פיקסל לפחות)
2. שמרו אותו כ-`public/logo.png`
3. הלוגו יתעדכן בכל האתר אוטומטית

---

## ☁️ פריסה ל-Vercel

### אפשרות א: Vercel CLI (מהירה)

```bash
# התקנת CLI
npm install -g vercel

# התחברות
vercel login

# פריסה לייצור
vercel --prod
```

תקבלו URL בצורה: `https://game-day-xxx.vercel.app`

### אפשרות ב: דרך GitHub

1. העלו ל-GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/game-day.git
git push -u origin main
```

2. כנסו ל-[vercel.com](https://vercel.com) → **Add New Project**
3. בחרו את ה-repo → **Deploy**
4. תקבלו URL ציבורי תוך כדקה!

---

## 🔗 חיבור דומיין משלכם

1. ב-Vercel: **Project → Settings → Domains**
2. הוסיפו את הדומיין שלכם (למשל `games.yourcompany.com`)
3. הוסיפו את רשומות ה-DNS שיציג Vercel אצל רשם הדומיין
4. המתינו עד 48 שעות (בדרך כלל פחות מ-10 דקות)
5. ✅ Vercel מנפיק SSL אוטומטית

---

## 🎯 מערכת ניקוד

| ניסיון | ניקוד |
|--------|-------|
| ללא רמזים | 100 נקודות |
| רמז 1 | ~75 נקודות |
| רמז 2 | ~50 נקודות |
| כל הרמזים | ~25 נקודות |

הניקוד נשמר ב-localStorage – משתמר גם לאחר רענון.

---

## 🛠️ פקודות

```bash
npm run dev      # שרת פיתוח
npm run build    # בניה לייצור
npm run start    # הרצת build מקומי
npm run lint     # בדיקת קוד
npm run format   # עיצוב קוד
```

---

## ❓ שאלות נפוצות

**האם צריך לשלם על Vercel?**
לא. הפלן החינמי מספיק לחלוטין.

**האם נשמר מידע בשרת?**
לא. הכל ב-localStorage של הדפדפן.

**איך מעדכנים את השאלות אחרי פריסה?**
עדכנו את קבצי ה-JSON, עשו `git push`, ו-Vercel יפרוס אוטומטית.

**כמה משתמשים יכולים לשחק בו-זמנית?**
אין הגבלה – כל משתמש רץ בדפדפן שלו.
