const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface GenerateRequest {
  youtube_url: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  context: string;
}

interface Card {
  front: string;
  back: string;
  keyword: string;
  grammar_note: string;
  context_note: string;
  colombian_note: string;
  timestamp_start: number;
  timestamp_end: number;
  audio_filename: string;
  card_type: "vocabulary" | "phrase" | "idiom" | "grammar_pattern";
}

interface GenerateResponse {
  deck_id: string;
  video_title: string;
  video_thumbnail: string;
  video_id: string;
  cards: Card[];
  model_used: string;
  total_cards: number;
}

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "APIError";
  }
}

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new APIError(
      response.status,
      error.detail || error.message || `Error ${response.status}`
    );
  }

  return response.json();
}

export const api = {
  generateDeck: (data: GenerateRequest): Promise<GenerateResponse> =>
    fetchAPI("/api/decks/generate", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getDeck: (deckId: string): Promise<GenerateResponse> =>
    fetchAPI(`/api/decks/${deckId}`),

  downloadDeck: async (deckId: string): Promise<Blob> => {
    const response = await fetch(`${API_URL}/api/decks/${deckId}/download`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new APIError(
        response.status,
        error.detail || error.message || `Error ${response.status}`
      );
    }

    return response.blob();
  },

  getMyDecks: (): Promise<{
    decks: Array<{
      deck_id: string;
      video_title: string;
      video_thumbnail: string;
      video_id: string;
      level: string;
      context: string;
      total_cards: number;
      model_used: string;
      created_at: string;
    }>;
    total: number;
  }> => fetchAPI("/api/decks/user/my-decks"),
};
