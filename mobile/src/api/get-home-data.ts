import api from '../lib/axios';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export interface HomeDataResponse {
  balance: number;
  income: number;
  expense: number;
  recentTransactions: Transaction[];
}

export async function getHomeData(): Promise<HomeDataResponse> {
  const response = await api.get<HomeDataResponse>('/summary/home');
  return response.data;
}
