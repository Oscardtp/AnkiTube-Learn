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
  level: string;
  context: string;
  cards: Card[];
  model_used: string;
  total_cards: number;
  created_at?: string;
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
  study_skills?: string[];
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

  generateDeckSSE: async (
    data: GenerateRequest,
    onEvent: (event: string, payload: Record<string, unknown>) => void,
    signal?: AbortSignal,
  ): Promise<void> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    const response = await fetch(`${API_URL}/api/decks/generate-stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
      signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new APIError(
        response.status,
        error.detail || error.message || `Error ${response.status}`
      );
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const frames = buffer.split("\n\n");
      buffer = frames.pop()!;

      for (const frame of frames) {
        const eventMatch = frame.match(/^event: (.+)$/m);
        const dataMatch = frame.match(/^data: (.+)$/m);
        if (eventMatch && dataMatch) {
          try {
            onEvent(eventMatch[1], JSON.parse(dataMatch[1]));
          } catch {
            // Skip malformed events
          }
        }
      }
    }
  },

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

  // TODO: Backend UserCreate model solo acepta email + password.
  // Cuando el backend soporte name y preferred_language, enviarlos en el body.
  register: (
    email: string,
    password: string,
    _name?: string,
    _preferredLanguage?: string,
  ): Promise<{ access_token: string; user: UserResponse }> =>
    fetchAPI("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  getCurrentUser: (): Promise<UserResponse> => fetchAPI("/api/auth/me"),

  forgotPassword: (email: string): Promise<{ message: string }> =>
    fetchAPI("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  updateProfile: (data: { custom_name?: string; preferred_language?: string }): Promise<{ message: string; fields: string[] }> =>
    fetchAPI("/api/auth/me", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Wizard
  updateWizard: (answers: {
    level: string;
    goal: string;
    daily_minutes: number;
    content_type: string;
    cards_per_day: number;
  }): Promise<{ message: string; setup_wizard_completed: boolean }> =>
    fetchAPI("/api/auth/wizard", {
      method: "PATCH",
      body: JSON.stringify(answers),
    }),

  // Feedback — maps frontend fields to backend contract
  submitFeedback: (data: {
    type: "post_generation" | "post_download" | "card_report" | "nps" | "general"
    rating?: number
    comment?: string
    card_id?: string
    issue?: string
    deck_id?: string
  }): Promise<{ message: string }> => {
    // Map rating number to quick_answer string
    const ratingToAnswer: Record<number, string> = {
      1: "No era lo que esperaba",
      2: "Más o menos",
      3: "Bien",
      4: "Buenísimas",
      5: "🔥",
    }
    // Map frontend type to backend moment
    const typeToMoment: Record<string, string> = {
      post_generation: "post_generation",
      post_download: "post_generation",
      card_report: "card_report",
      nps: "nps",
      general: "general",
    }
    // Map issue to intent
    const issueToIntent: Record<string, string> = {
      report: "report",
      suggestion: "suggestion",
      praise: "praise",
    }

    const body = {
      moment: typeToMoment[data.type] || data.type,
      quick_answer: data.rating ? ratingToAnswer[data.rating] || String(data.rating) : data.comment || "default",
      text: data.comment || undefined,
      intent: data.issue ? issueToIntent[data.issue] || data.issue : undefined,
      deck_id: data.deck_id || undefined,
      card_id: data.card_id || undefined,
    }

    return fetchAPI("/api/feedback", {
      method: "POST",
      body: JSON.stringify(body),
    })
  },

  // Admin
  getAdminMetrics: (twoFactorCode?: string): Promise<any> =>
    fetchAPI("/api/admin/metrics", {
      headers: twoFactorCode ? { "X-2FA-Code": twoFactorCode } : {},
    }),

  getAdminUsers: (page: number = 1, limit: number = 20): Promise<any> =>
    fetchAPI(`/api/admin/users?page=${page}&limit=${limit}`),

  updateAdminUserRole: (userId: string, role: string, twoFactorCode?: string): Promise<{ id: string; role: string }> =>
    fetchAPI(`/api/admin/users/${userId}/role?role=${encodeURIComponent(role)}`, {
      method: "PATCH",
      headers: twoFactorCode ? { "X-2FA-Code": twoFactorCode } : {},
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

  // Discover
  getDiscoverVideos: (
    tag?: string | null,
    level?: string | null,
    page?: number,
  ): Promise<{
    videos: Array<{
      id: string
      video_id: string
      title: string
      thumbnail: string
      channel: string
      duration_seconds: number
      tags: string[]
      level: string
      description: string | null
    }>
    total: number
    page: number
    limit: number
  }> => {
    const params = new URLSearchParams()
    if (tag) params.append("tag", tag)
    if (level) params.append("level", level)
    if (page) params.append("page", String(page))
    const qs = params.toString()
    return fetchAPI(`/api/discover/videos${qs ? `?${qs}` : ""}`)
  },

  getDiscoverTags: (): Promise<{
    tags: Array<{ name: string; count: number }>
  }> => fetchAPI("/api/discover/tags"),

  // Study
  getStudyStatus: (deckId: string): Promise<{
    deck_id: string
    video_title: string
    video_id: string
    total_cards: number
    due_cards: number
    new_cards: number
    review_cards: number
    streak_days: number
    last_studied: string | null
    cards: Array<{
      card_index: number
      front: string
      back: string
      keyword: string
      grammar_note: string
      context_note: string
      colombian_note: string
      timestamp_start: number
      timestamp_end: number
      audio_filename: string
      card_type: string
      sm2_data: {
        interval: number
        easiness: number
        reps: number
        due_date: string | null
        last_reviewed: string | null
      } | null
    }>
  }> => fetchAPI(`/api/decks/${deckId}/study-status`),

  submitStudyResults: (
    deckId: string,
    results: Array<{ card_id: string; quality: number }>,
    sessionDurationSeconds: number,
  ): Promise<{ message: string; streak_days: number }> =>
    fetchAPI(`/api/decks/${deckId}/study-results`, {
      method: "PATCH",
      body: JSON.stringify({
        deck_id: deckId,
        results,
        session_duration_seconds: sessionDurationSeconds,
      }),
    }),

  getStudySummary: (deckId: string): Promise<{
    total_reviewed: number
    again_count: number
    hard_count: number
    good_count: number
    easy_count: number
    avg_quality: number
    session_duration_seconds: number
    streak_days: number
  }> => fetchAPI(`/api/decks/${deckId}/study-summary`),

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

  getStudySkills: (): Promise<{ skills: string[] }> =>
    fetchAPI("/api/auth/study-skills"),

  saveStudySkills: (skills: string[]): Promise<{ message: string; skills: string[] }> =>
    fetchAPI("/api/auth/study-skills", {
      method: "PUT",
      body: JSON.stringify({ skills }),
    }),
};
