export type CardType = "vocabulary" | "phrase" | "idiom" | "grammar_pattern";

export interface Card {
  front: string;
  back: string;
  keyword: string;
  grammar_note: string;
  context_note: string;
  colombian_note: string; // Obligatorio
  timestamp_start: number;
  timestamp_end: number;
  audio_filename?: string;
  card_type: CardType;
}

export interface DeckData {
  deck_id: string;
  video_id: string;
  video_title: string;
  video_thumbnail: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | string;
  context: string;
  cards: Card[];
  model_used: string;
  total_cards: number;
  is_saved?: boolean;
  created_at?: string;
}
