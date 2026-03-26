"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import {
  api,
  CallCenterPhrase,
  PracticeScenario,
  UserProgress,
  Achievement,
  PracticeSession,
  SubmitResponseRequest,
  SubmitResponseResult,
  getToken,
} from "@/lib/api";

// ============ PHRASES HOOKS ============

export function usePhrases(params?: {
  category?: string;
  difficulty?: string;
  limit?: number;
  offset?: number;
}) {
  const key = getToken()
    ? ["phrases", params?.category, params?.difficulty, params?.limit, params?.offset]
    : null;

  return useSWR(key, () => api.getPhrases(params), {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 minute
  });
}

export function usePhrase(phraseId: string | null) {
  const key = phraseId && getToken() ? ["phrase", phraseId] : null;

  return useSWR(key, () => api.getPhrase(phraseId!), {
    revalidateOnFocus: false,
  });
}

export function useMarkPhraseAsLearned() {
  return useSWRMutation(
    "markPhraseLearned",
    async (_key: string, { arg }: { arg: string }) => {
      return api.markPhraseAsLearned(arg);
    }
  );
}

// ============ SCENARIOS HOOKS ============

export function useScenarios(params?: {
  category?: string;
  difficulty?: string;
}) {
  const key = getToken()
    ? ["scenarios", params?.category, params?.difficulty]
    : null;

  return useSWR(key, () => api.getScenarios(params), {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });
}

export function useScenario(scenarioId: string | null) {
  const key = scenarioId && getToken() ? ["scenario", scenarioId] : null;

  return useSWR(key, () => api.getScenario(scenarioId!), {
    revalidateOnFocus: false,
  });
}

// ============ PRACTICE SESSION HOOKS ============

export function useStartPracticeSession() {
  return useSWRMutation(
    "startPractice",
    async (_key: string, { arg }: { arg: string }) => {
      return api.startPracticeSession(arg);
    }
  );
}

export function useSubmitResponse() {
  return useSWRMutation(
    "submitResponse",
    async (_key: string, { arg }: { arg: SubmitResponseRequest }) => {
      return api.submitResponse(arg);
    }
  );
}

export function useCompletePracticeSession() {
  return useSWRMutation(
    "completePractice",
    async (_key: string, { arg }: { arg: string }) => {
      return api.completePracticeSession(arg);
    }
  );
}

// ============ PROGRESS HOOKS ============

export function useUserProgress() {
  const key = getToken() ? "userProgress" : null;

  return useSWR(key, () => api.getUserProgress(), {
    revalidateOnFocus: false,
    dedupingInterval: 30000, // 30 seconds
  });
}

export function useAchievements() {
  const key = getToken() ? "achievements" : null;

  return useSWR(key, () => api.getAchievements(), {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });
}

// ============ LICENSE HOOKS ============

export function useActivateLicense() {
  return useSWRMutation(
    "activateLicense",
    async (_key: string, { arg }: { arg: string }) => {
      return api.activateLicense(arg);
    }
  );
}
