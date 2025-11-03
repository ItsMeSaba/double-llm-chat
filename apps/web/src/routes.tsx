import { StatisticsPage } from "./pages/statistics/Statistics";
import { DualChatPage } from "./pages/dual-chat/DualChat";
import { LoginPage } from "./pages/login/Login";

export const routes = [
  { path: "/", element: <LoginPage />, protected: false },
  { path: "/dual-chat", element: <DualChatPage />, protected: true },
  { path: "/statistics", element: <StatisticsPage />, protected: true },
];
