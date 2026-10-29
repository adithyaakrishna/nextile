import type { FinishBody, FinishResponse, HistoryResponse, StartResponse, TodayResponse } from "./api-types";

const TIMEOUT_MS = 8_000;

export interface ApiFailure extends Error {
  status: number;
}

function apiFailure(message: string, status: number): ApiFailure {
  return Object.assign(new Error(message), { status });
}

export function isApiFailure(error: unknown): error is ApiFailure {
  return error instanceof Error && typeof (error as Partial<ApiFailure>).status === "number";
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: init.body ? { "Content-Type": "application/json" } : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw apiFailure(body?.error ?? `Request failed (${response.status})`, response.status);
  }
  return (await response.json()) as T;
}

export function fetchToday(): Promise<TodayResponse> {
  return request<TodayResponse>("/api/today");
}

export function openAttempt(): Promise<StartResponse> {
  return request<StartResponse>("/api/attempts", { method: "POST" });
}

export function finishAttempt(attemptId: string, body: FinishBody): Promise<FinishResponse> {
  return request<FinishResponse>(`/api/attempts/${encodeURIComponent(attemptId)}/finish`, { method: "POST", body: JSON.stringify(body) });
}

export function fetchHistory(): Promise<HistoryResponse> {
  return request<HistoryResponse>("/api/history");
}
