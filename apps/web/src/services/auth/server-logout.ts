export async function serverLogout() {
  return await fetch(import.meta.env.VITE_SERVER_URL + "/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}
