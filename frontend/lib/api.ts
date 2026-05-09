const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

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

interface UserResponse {
  id: string;
  email: string;
  role: string;
  setup_wizard_completed: boolean;
  generations_today: number;
  total_decks?: number;
  total_cards?: number;
  level?: string;
  custom_name?: string;
}

interface DeckListResponse {
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
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
  // Decks
  generateDeck: (data: GenerateRequest): Promise<GenerateResponse> =>
    fetchAPI("/api/decks/generate", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getDeck: (deckId: string): Promise<GenerateResponse> =>
    fetchAPI(`/api/decks/${deckId}`),

  getMyDecks: (): Promise<DeckListResponse> =>
    fetchAPI("/api/decks/user/my-decks"),

  deleteDeck: (deckId: string): Promise<void> =>
    fetchAPI(`/api/decks/${deckId}`, { method: "DELETE" }),

  claimDeck: (deckId: string, anonymousSessionId?: string): Promise<{ message: string; deck_id: string }> =>
    fetchAPI(
      `/api/decks/${deckId}/claim${anonymousSessionId ? `?anonymous_session_id=${encodeURIComponent(anonymousSessionId)}` : ""}`,
      { method: "POST" }
    ),

  addCard: (deckId: string, phrase?: string, timestamp?: number): Promise<Card> =>
    fetchAPI(`/api/decks/${deckId}/cards/add`, {
      method: "POST",
      body: JSON.stringify({ phrase, timestamp }),
    }),

  // Auth
  login: (email: string, password: string): Promise<{ access_token: string; user: UserResponse }> =>
    fetchAPI("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string): Promise<{ access_token: string; user: UserResponse }> =>
    fetchAPI("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  getCurrentUser: (): Promise<UserResponse> => fetchAPI("/api/auth/me"),

  // Feedback
  submitFeedback: (data: {
    type: "post_generation" | "post_download" | "card_report" | "nps" | "general"
    rating?: number
    comment?: string
    card_id?: string
    issue?: string
    deck_id?: string
  }): Promise<{ message: string }> =>
    fetchAPI("/api/feedback", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Admin
  getAdminMetrics: (twoFactorCode?: string): Promise<any> =>
    fetchAPI("/api/admin/metrics", {
      headers: twoFactorCode ? { "X-2FA-Code": twoFactorCode } : {},
    }),

  getAdminUsers: (page: number = 1, limit: number = 20): Promise<any> =>
    fetchAPI(`/api/admin/users?page=${page}&limit=${limit}`),

  updateAdminUserRole: (userId: string, role: string, twoFactorCode?: string): Promise<{ id: string; role: string }> =>
    fetchAPI(`/api/admin/users/${userId}/role`, {
      method: "PATCH",
      headers: twoFactorCode ? { "X-2FA-Code": twoFactorCode } : {},
      body: JSON.stringify({ role }),
    }),

  getAdminFeedback: (page: number = 1, limit: number = 50, moment?: string, intent?: string, twoFactorCode?: string): Promise<any> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (moment) params.append('moment', moment)
    if (intent) params.append('intent', intent)
    return fetchAPI(`/api/admin/feedback?${params.toString()}`, {
      headers: twoFactorCode ? { "X-2FA-Code": twoFactorCode } : {},
    })
  },

  getFlaggedCards: (twoFactorCode?: string): Promise<any> =>
    fetchAPI("/api/admin/flagged-cards", {
      headers: twoFactorCode ? { "X-2FA-Code": twoFactorCode } : {},
    }),

  getAdminLicenses: (twoFactorCode?: string): Promise<any> =>
    fetchAPI("/api/licenses/admin", {
      headers: twoFactorCode ? { "X-2FA-Code": twoFactorCode } : {},
    }),

  createAdminLicense: (data: any, twoFactorCode?: string): Promise<any> =>
    fetchAPI("/api/licenses/admin", {
      method: "POST",
      headers: twoFactorCode ? { "X-2FA-Code": twoFactorCode } : {},
      body: JSON.stringify(data),
    }),

  deleteAdminLicense: (code: string, twoFactorCode?: string): Promise<{ message: string }> =>
    fetchAPI(`/api/licenses/admin/${code}`, {
      method: "DELETE",
      headers: twoFactorCode ? { "X-2FA-Code": twoFactorCode } : {},
    }),

  // License activation
  activateLicense: (code: string): Promise<any> =>
    fetchAPI("/api/licenses/activate", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),

  // Download
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
};
