import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react";
import { serverLogout } from "../../services/auth/server-logout";
import { refreshToken } from "../../services/auth/refresh-token";
import { setAccessToken } from "../../services/http";

type AuthCtx = {
  isAuthed: boolean;
  loading: boolean;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const didStrictModeRun = useRef(false);

  useEffect(() => {
    if (didStrictModeRun.current) return; // For StrictMode
    didStrictModeRun.current = true;

    const controller = new AbortController();

    async function getRefreshToken() {
      try {
        const newRefreshToken = await refreshToken(controller.signal);

        if (newRefreshToken) {
          setAccessToken(newRefreshToken);
          setAuthed(true);
        }
      } catch (e) {
      } finally {
        setLoading(false);
      }
    }

    getRefreshToken();

    // FIXME: overlapping with StrictMode solution
    // return () => controller.abort();
  }, []);

  async function logout() {
    await serverLogout();
    setAccessToken(null);
    setAuthed(false);
  }

  const value = useMemo(
    () => ({ isAuthed, loading, logout }),
    [isAuthed, loading]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
