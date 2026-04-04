import api from './api';

export interface DailyLogEntry {
  flockId: number;
  date: string;
  mortalityCount: number;
  feedConsumedKg: number;
  eggsCollected: number;
  averageBirdWeightGm: number;
  notes?: string;
}

export const dailyLogService = {
  createEntry: async (data: DailyLogEntry) => {
    const response = await api.post('/DailyLogs', data);
    return response.data;
  },
  getFlockMetrics: async (flockId: number) => {
    const response = await api.get(`/DailyLogs/Metrics/${flockId}`);
    return response.data;
  }
};