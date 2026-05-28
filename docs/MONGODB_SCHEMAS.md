# MongoDB Schemas — AnkiTube Learn

---

## Card (embebida en Deck)

```javascript
{
  front: String,              // "What's the rush?"
  back: String,               // "¿Cuál es la prisa?"
  keyword: String,            // "rush"
  grammar_note: String,       // "What's = What is"
  context_note: String,       // "Usado cuando algo es urgente"
  colombian_note: String,     // "¿Cuál es el afán?" — OBLIGATORIO
  timestamp_start: Number,    // 123 (segundos)
  timestamp_end: Number,      // 127
  audio_filename: String,     // "card_1.mp3"
  card_type: String           // "vocabulary" | "phrase" | "idiom" | "grammar_pattern"
}
```

---

## User

```javascript
{
  _id: ObjectId,
  email: String,              // unique
  password: String,           // bcrypt hash
  role: String,               // "user" | "premium" | "tester" | "superadmin"
  custom_name: String,        // OPCIONAL: nombre personalizado (único, case-insensitive)
  tester_expires_at: Date,
  last_generation_date: Date,
  generations_today: Number,
  setup_wizard_completed: Boolean,
  wizard_answers: {
    level: String,            // "B1"
    goal: String,
    daily_minutes: Number,
    content_type: String,
    cards_per_day: Number
  },
  created_at: Date,
  deleted_at: Date | null
}
```

---

## Deck

```javascript
{
  _id: ObjectId,
  user_id: ObjectId | null,    // null si anónimo
  anonymous_session_id: String, // UUID para usuarios anónimos
  title: String,
  video_url: String,
  video_title: String | null,
  cefr_level: String,           // "A1" | "A2" | "B1" | "B2" | "C1" | "C2"
  context_type: String,         // "general" | "business" | "tech" | etc.
  cards: [Card],                // array embebido
  total_cards: Number,
  status: String,               // "pending" | "generating" | "completed" | "failed"
  created_at: Date,
  updated_at: Date,
  deleted_at: Date | null
}
```

---

## Feedback

```javascript
{
  _id: ObjectId,
  user_id: ObjectId | null,   // null si anónimo
  deck_id: ObjectId | null,   // null si feedback general
  moment: String,             // "post_generation" | "post_download" | "card_report" | "nps" | "general"
  section: String | null,     // "generator" | "cards" | "study" | "pricing" | null
  intent: String | null,      // "report" | "suggestion" | "praise"
  quick_answer: String,       // opción elegida (ej. "5" para NPS)
  text: String | null,        // feedback texto libre
  created_at: Date
}
```

---

## License

```javascript
{
  _id: ObjectId,
  code: String,               // "ANKI-7K3P-2MNQ" — UNIQUE
  email: String,              // del tester
  duration_days: Number,      // 7, 15 o 30
  status: String,             // "pending" → "active" → "expired" → "revoked"
  activated_by: ObjectId,     // usuario que lo activó
  expires_at: Date,
  internal_note: String | null,
  created_at: Date
}
```
