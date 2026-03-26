const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ============ TYPES ============

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

// ============ AUTH TYPES ============

export interface User {
  id: string;
  email: string;
  role: "user" | "tester" | "premium" | "superadmin";
  setup_wizard_completed: boolean;
  generations_today: number;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// ============ CALL CENTER TRAINING TYPES ============

export interface CallCenterPhrase {
  id: string;
  english: string;
  spanish: string;
  phonetic: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  context: string;
  example_dialogue: {
    customer: string;
    agent: string;
  };
  tips: string[];
  audio_url?: string;
}

export interface PracticeScenario {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
  customer_persona: string;
  situation: string;
  expected_responses: string[];
  hints: string[];
}

export interface UserProgress {
  user_id: string;
  total_phrases_learned: number;
  total_practice_sessions: number;
  current_streak: number;
  longest_streak: number;
  total_points: number;
  level: number;
  skills: {
    greetings: number;
    problem_solving: number;
    empathy: number;
    closing: number;
    pronunciation: number;
  };
  achievements: Achievement[];
  weekly_activity: { day: string; sessions: number; points: number }[];
  last_session_at: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlocked_at?: string;
  progress?: number;
  target?: number;
}

export interface PracticeSession {
  id: string;
  scenario_id: string;
  started_at: string;
  completed_at?: string;
  score: number;
  correct_responses: number;
  total_responses: number;
  feedback: string[];
}

export interface SubmitResponseRequest {
  session_id: string;
  scenario_id: string;
  user_response: string;
  expected_response: string;
}

export interface SubmitResponseResult {
  is_correct: boolean;
  score: number;
  feedback: string;
  similarity_percentage: number;
  suggestions: string[];
}

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "APIError";
  }
}

// ============ TOKEN MANAGEMENT ============

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ankitube_token");
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("ankitube_token", token);
}

export function removeToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("ankitube_token");
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("ankitube_user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function setUser(user: User): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("ankitube_user", JSON.stringify(user));
}

export function removeUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("ankitube_user");
}

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit,
  requireAuth = false
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };

  if (requireAuth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
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
  // ============ DECK ENDPOINTS ============
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
        Authorization: `Bearer ${getToken() || ""}`,
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
  }> => fetchAPI("/api/decks/user/my-decks", undefined, true),

  // ============ AUTH ENDPOINTS ============
  register: (data: RegisterRequest): Promise<AuthResponse> =>
    fetchAPI("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: LoginRequest): Promise<AuthResponse> =>
    fetchAPI("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMe: (): Promise<User> => fetchAPI("/api/auth/me", undefined, true),

  // ============ CALL CENTER TRAINING ENDPOINTS ============
  
  // Phrases
  getPhrases: (params?: {
    category?: string;
    difficulty?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ phrases: CallCenterPhrase[]; total: number }> => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set("category", params.category);
    if (params?.difficulty) searchParams.set("difficulty", params.difficulty);
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.offset) searchParams.set("offset", params.offset.toString());
    const query = searchParams.toString();
    return fetchAPI(`/api/callcenter/phrases${query ? `?${query}` : ""}`, undefined, true);
  },

  getPhrase: (phraseId: string): Promise<CallCenterPhrase> =>
    fetchAPI(`/api/callcenter/phrases/${phraseId}`, undefined, true),

  markPhraseAsLearned: (phraseId: string): Promise<{ message: string; points_earned: number }> =>
    fetchAPI(`/api/callcenter/phrases/${phraseId}/learned`, { method: "POST" }, true),

  // Practice
  getScenarios: (params?: {
    category?: string;
    difficulty?: string;
  }): Promise<{ scenarios: PracticeScenario[]; total: number }> => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set("category", params.category);
    if (params?.difficulty) searchParams.set("difficulty", params.difficulty);
    const query = searchParams.toString();
    return fetchAPI(`/api/callcenter/scenarios${query ? `?${query}` : ""}`, undefined, true);
  },

  getScenario: (scenarioId: string): Promise<PracticeScenario> =>
    fetchAPI(`/api/callcenter/scenarios/${scenarioId}`, undefined, true),

  startPracticeSession: (scenarioId: string): Promise<PracticeSession> =>
    fetchAPI(`/api/callcenter/practice/start`, {
      method: "POST",
      body: JSON.stringify({ scenario_id: scenarioId }),
    }, true),

  submitResponse: (data: SubmitResponseRequest): Promise<SubmitResponseResult> =>
    fetchAPI(`/api/callcenter/practice/submit`, {
      method: "POST",
      body: JSON.stringify(data),
    }, true),

  completePracticeSession: (sessionId: string): Promise<{
    session: PracticeSession;
    points_earned: number;
    achievements_unlocked: Achievement[];
  }> =>
    fetchAPI(`/api/callcenter/practice/${sessionId}/complete`, { method: "POST" }, true),

  // Progress
  getUserProgress: (): Promise<UserProgress> =>
    fetchAPI("/api/callcenter/progress", undefined, true),

  getAchievements: (): Promise<{ achievements: Achievement[]; total_unlocked: number }> =>
    fetchAPI("/api/callcenter/achievements", undefined, true),

  // Licenses
  activateLicense: (code: string): Promise<{ message: string; expires_at: string; role: string }> =>
    fetchAPI("/api/licenses/activate", {
      method: "POST",
      body: JSON.stringify({ code }),
    }, true),
};

export { APIError };
