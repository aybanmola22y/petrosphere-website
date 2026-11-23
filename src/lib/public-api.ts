/** Client-safe fetch helpers for cached public API routes. */

async function fetchPublicJson<T>(path: string): Promise<T> {
  const res = await fetch(path, {
    credentials: "same-origin",
    // Prefer browser HTTP cache (API routes send max-age / SWR headers).
    cache: "force-cache",
  });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${path}`);
  }
  return (await res.json()) as T;
}

export function fetchPublicCatalog<T>(): Promise<T> {
  return fetchPublicJson<T>("/api/public/catalog");
}

export function fetchPublicSchedules<T>(): Promise<T> {
  return fetchPublicJson<T>("/api/public/schedules");
}
