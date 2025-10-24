export async function refreshTheToken(signal?: AbortSignal) {
  const res = await fetch(import.meta.env.VITE_SERVER_URL + "/auth/refresh", {
    method: "POST",
    credentials: "include",
    signal,
  });

  if (!res.ok) return null;

  const json = await res.json().catch(() => null);
  return json?.accessToken ?? null;
}
