let accessToken: string | null = null;

export const setAccessToken = (t: string | null) => (accessToken = t);
export const getAccessToken = () => accessToken;

export async function http(
  url: string,
  options: RequestInit = {},
  retry = true
) {
  const headers = new Headers(options.headers || {});

  const _accessToken = getAccessToken();
  if (_accessToken) headers.set("Authorization", `Bearer ${_accessToken}`);

  const res = await fetch(import.meta.env.VITE_SERVER_URL + url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status !== 401 || !retry) return res;

  // silent refresh (cookie)
  const refreshResponse = await fetch(
    import.meta.env.VITE_SERVER_URL + "/auth/refresh",
    {
      method: "POST",
      credentials: "include",
    }
  );

  if (!refreshResponse.ok) return res;

  const { accessToken: newAccessToken } = await refreshResponse.json();
  setAccessToken(newAccessToken ?? null);

  const newHeaders = new Headers(options.headers || {});

  if (newAccessToken)
    newHeaders.set("Authorization", `Bearer ${newAccessToken}`);

  return fetch(import.meta.env.VITE_SERVER_URL + url, {
    ...options,
    headers: newHeaders,
    credentials: "include",
  });
}
