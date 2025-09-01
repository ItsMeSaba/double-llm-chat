import { createContext, useContext, useEffect, useRef, useState } from "react";
import { setAccessToken } from "../../service/http";

type AuthCtx = {
  isAuthed: boolean;
  loading: boolean;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const didRun = useRef(false);

  useEffect(() => {
    // For StrictMode
    if (didRun.current) return;
    didRun.current = true;

    (async () => {
      console.log("running auth provider");
      try {
        const res = await fetch(
          import.meta.env.VITE_SERVER_URL + "/auth/refresh",
          {
            method: "POST",
            credentials: "include",
          }
        );

        if (res.ok) {
          const { accessToken } = await res.json();

          if (accessToken) {
            setAccessToken(accessToken);
            setAuthed(true);
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function logout() {
    console.log("logging out");

    await fetch(import.meta.env.VITE_SERVER_URL + "/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setAccessToken(null);
    setAuthed(false);
  }

  return (
    <Ctx.Provider value={{ isAuthed, loading, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
