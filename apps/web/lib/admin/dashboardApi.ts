import { adminFetch } from "../adminFetch";

export type DashboardStats = {
  totalRevenue: number;
  revenueTrend: number;
  bookingsThisMonth: number;
  bookingsTrend: number;
  activeTours: number;
  newUsers: number;
  usersTrend: number;
  recentBookings: Array<{
    id: string;
    customer: string;
    tour: string;
    date: string;
    amount: number;
    status: string;
  }>;
};

export async function getDashboardStats(range: string = "month"): Promise<DashboardStats> {
  const res = await adminFetch(`/dashboard/stats?range=${range}`);
  if (!res.ok) {
    throw new Error("Không thể tải dữ liệu dashboard.");
  }
  return res.json();
}

export async function getDashboardReport(): Promise<any[]> {
  const res = await adminFetch("/dashboard/report");
  if (!res.ok) {
    throw new Error("Không thể tải báo cáo.");
  }
  return res.json();
}

