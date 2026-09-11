/** Thin API layer for a future Node/Express backend. Pages should call these helpers instead of fetch-ing URLs directly. */

export const api = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "/api",
  async get<T>(path: string, fallback: T): Promise<T> {
    try {
      const res = await fetch(`${this.baseUrl}${path}`);
      if (!res.ok) return fallback;
      return (await res.json()) as T;
    } catch {
      return fallback;
    }
  },
  async post<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await response.json()) as T & { error?: string };
    if (!response.ok) throw new Error(data.error || "Request failed");
    return data;
  },
};
