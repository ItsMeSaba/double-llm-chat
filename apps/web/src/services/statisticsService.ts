import { http } from "../service/http";

export interface ChartData {
  name: string;
  value: number;
  model: string;
}

export interface StatisticsSummary {
  gptLikes: number;
  geminiLikes: number;
}

export interface StatisticsResponse {
  chartData: ChartData[];
  totalFeedback: number;
  summary: StatisticsSummary;
}

export interface FetchStatisticsResponse {
  success: boolean;
  data: StatisticsResponse;
}

export async function fetchStatistics(): Promise<FetchStatisticsResponse> {
  const response = await http("/chat/statistics", {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch statistics: ${response.statusText}`);
  }

  return response.json();
}