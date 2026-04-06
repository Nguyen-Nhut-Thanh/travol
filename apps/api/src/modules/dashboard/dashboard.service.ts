import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

type RecentBookingRecord = {
  booking_id: number;
  created_at: Date;
  total_amount: unknown;
  status: string;
  contact_name: string;
  users?: { full_name: string | null } | null;
  tour_schedules?: {
    tours?: {
      name?: string | null;
      code?: string | null;
    } | null;
  } | null;
};

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  private readonly revenueStatuses = ['confirmed', 'completed', 'paid'] as const;

  private mapRecentBooking(booking: RecentBookingRecord) {
    return {
      id: `BK${booking.booking_id.toString().padStart(3, '0')}`,
      tourCode: booking.tour_schedules?.tours?.code || 'N/A',
      customer: booking.users?.full_name || booking.contact_name,
      tour: booking.tour_schedules?.tours?.name || 'N/A',
      date: booking.created_at.toISOString(),
      amount: Number(booking.total_amount),
      status: booking.status,
    };
  }

  private calculateTrend(current: number, previous: number) {
    if (previous === 0) return current > 0 ? 100 : 0;
    const trend = ((current - previous) / previous) * 100;
    return parseFloat(trend.toFixed(1));
  }

  async getStats(range: string = 'month') {
    const now = new Date();
    let startDate: Date;
    let prevStartDate: Date;
    let prevEndDate: Date;

    switch (range) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        prevStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        prevEndDate = startDate;
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        prevStartDate = new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        prevEndDate = startDate;
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        prevStartDate = new Date(now.getFullYear() - 1, 0, 1);
        prevEndDate = startDate;
        break;
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        prevEndDate = startDate;
        break;
    }

    const [
      currentRevenue,
      prevRevenue,
      currentBookings,
      prevBookings,
      activeTours,
      currentUsers,
      prevUsers,
      recentBookingsRaw,
    ] = await Promise.all([
      // Current Revenue
      this.prisma.bookings.aggregate({
        where: { status: { in: [...this.revenueStatuses] }, created_at: { gte: startDate } },
        _sum: { total_amount: true },
      }),
      // Previous Revenue
      this.prisma.bookings.aggregate({
        where: { status: { in: [...this.revenueStatuses] }, created_at: { gte: prevStartDate, lt: prevEndDate } },
        _sum: { total_amount: true },
      }),
      // Current Bookings
      this.prisma.bookings.count({ where: { created_at: { gte: startDate } } }),
      // Previous Bookings
      this.prisma.bookings.count({ where: { created_at: { gte: prevStartDate, lt: prevEndDate } } }),
      // Active Tours (Always current)
      this.prisma.tours.count({ where: { status: 1 } }),
      // Current Users
      this.prisma.users.count({ where: { created_at: { gte: startDate } } }),
      // Previous Users
      this.prisma.users.count({ where: { created_at: { gte: prevStartDate, lt: prevEndDate } } }),
      // Recent Bookings
      this.prisma.bookings.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        include: {
          users: { select: { full_name: true } },
          tour_schedules: { include: { tours: { select: { name: true, code: true } } } },
        },
      }),
    ]);

    const totalRevenue = Number(currentRevenue._sum.total_amount || 0);
    const previousRevenueVal = Number(prevRevenue._sum.total_amount || 0);

    return {
      totalRevenue,
      revenueTrend: this.calculateTrend(totalRevenue, previousRevenueVal),
      bookingsThisMonth: currentBookings,
      bookingsTrend: this.calculateTrend(currentBookings, prevBookings),
      activeTours,
      newUsers: currentUsers,
      usersTrend: this.calculateTrend(currentUsers, prevUsers),
      recentBookings: recentBookingsRaw.map((booking) => this.mapRecentBooking(booking)),
    };
  }

  async getReport() {
    const bookings = await this.prisma.bookings.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        users: {
          include: {
            accounts: {
              select: { email: true },
            },
          },
        },
        tour_schedules: {
          include: {
            tours: {
              select: { name: true, code: true },
            },
          },
        },
      },
    });

    return bookings.map((b: any) => ({
      'Mã Đơn': `BK${b.booking_id.toString().padStart(3, '0')}`,
      'Ngày đặt': b.created_at.toISOString().split('T')[0],
      'Khách hàng': b.users?.full_name || b.contact_name,
      'Email': b.users?.accounts?.email || b.contact_email || 'N/A',
      'Tour': b.tour_schedules?.tours?.name || 'N/A',
      'Mã Tour': b.tour_schedules?.tours?.code || 'N/A',
      'Tổng tiền': Number(b.total_amount),
      'Trạng thái': b.status,
    }));
  }
}
