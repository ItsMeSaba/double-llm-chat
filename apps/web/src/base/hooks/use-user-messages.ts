import { getUserMessages } from "@/services/messages/get-user-messages";
import { useEffect, useState, useCallback, useRef } from "react";
import { to } from "@/base/utils/to";
import type { MessageWithLLMResponsesDTO } from "@shared/dtos/messages";

export function useUserMessages() {
  const [messages, setMessages] = useState<MessageWithLLMResponsesDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const res = await to(() => getUserMessages());

    if (!mounted.current) return;

    if (!res.ok) {
      setError(res.error);
    } else {
      setMessages(res.data.data);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    mounted.current = true;

    load();

    return () => {
      mounted.current = false;
    };
  }, [load]);

  return { messages, loading, error, reload: load, setMessages };
}
