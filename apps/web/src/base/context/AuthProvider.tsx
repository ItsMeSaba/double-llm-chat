import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react";
import { refreshTheToken } from "../../services/auth/refresh-token";
import { serverLogout } from "../../services/auth/server-logout";
import { setAccessToken } from "../../services/http";
import { to } from "../utils/to";

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
      const result = await to(() => refreshTheToken(controller.signal));

      if (!result.ok) {
        return console.error("Error refreshing token:", result.error);
      }

      const newRefreshToken = result.data;

      if (newRefreshToken) {
        setAccessToken(newRefreshToken);
        setAuthed(true);
      }

      setLoading(false);
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
