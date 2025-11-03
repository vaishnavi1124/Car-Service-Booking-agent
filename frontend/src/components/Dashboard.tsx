
// frontend/src/components/Dashboard.tsx
import { useEffect, useState } from "react";
// Import the new chart components
import DailyLineChart from "./DailyLineChart";
import MonthlyBarChart from "./MonthlyBarChart";
import { format } from 'date-fns'; // We'll use this for table date

// --- Define ALL the types from the new API response ---
interface BookingDetail {
  customer_name: string;
  vehicle: string;
  appointment_date: string;
  status: string;
}

interface MonthlyBreakdown {
  month: string;
  bookings: number;
  cancellations: number;
}

interface Stats {
  daily_bookings: number;
  weekly_bookings: number;
  monthly_bookings: number;
  total_cancellations: number;
  todays_bookings_list: BookingDetail[];
  daily_bookings_chart: { [date: string]: number };
  yearly_breakdown_chart: MonthlyBreakdown[];
}

// Reusable StatCard (Updated Style)
const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: string }) => (
    <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-5 shadow-lg flex items-center gap-4 flex-1 min-w-[200px]">
        <div className="text-3xl p-3 rounded-lg bg-slate-700">{icon}</div>
        <div>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
        </div>
    </div>
);


export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // This must match the backend
        const response = await fetch("http://localhost:8000/dashboard-stats");
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data.");
        }
        const data: Stats = await response.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-slate-300">Loading Dashboard...</div>;
  }

  if (error) {
    return <div className="text-rose-400">Error: {error}</div>;
  }

  // Get current month and year for chart titles
  const currentMonth = format(new Date(), 'MMMM');
  const currentYear = format(new Date(), 'yyyy');

  return (
    // Use max-w-7xl to match the wider dashboard in your screenshot
    <div className="w-full max-w-7xl flex flex-col gap-6">
      
      {/* Section 1: Stat Cards */}
      <section className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-6">
        <StatCard title="Today's Bookings" value={stats?.daily_bookings ?? 0} icon="📅" />
        <StatCard title="Weekly Bookings" value={stats?.weekly_bookings ?? 0} icon="🗓️" />
        <StatCard title="Monthly Bookings" value={stats?.monthly_bookings ?? 0} icon="📊" />
        <StatCard title="Cancellations" value={stats?.total_cancellations ?? 0} icon="❌" />
      </section>
      
      {/* Section 2: Today's Bookings Table */}
      <section className="bg-slate-800/90 border border-slate-700 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-white mb-4">Today's Bookings</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left">
            <thead>
              <tr className="border-b border-slate-600 text-slate-400 uppercase text-xs">
                <th className="py-3 pr-3">Customer</th>
                <th className="py-3 px-3">Vehicle</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 pl-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats?.todays_bookings_list.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-slate-400">
                    No bookings for today.
                  </td>
                </tr>
              ) : (
                stats?.todays_bookings_list.map((booking, index) => (
                  <tr key={index} className="border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="py-4 pr-3">{booking.customer_name}</td>
                    <td className="py-4 px-3 font-mono">{booking.vehicle}</td>
                    <td className="py-4 px-3">{format(new Date(booking.appointment_date), 'yyyy-MM-dd')}</td>
                    <td className="py-4 pl-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'Confirmed' ? 'bg-green-800 text-green-200' : 
                        booking.status === 'Cancelled' ? 'bg-red-800 text-red-200' : 'bg-yellow-800 text-yellow-200'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 3: Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-6 shadow-lg h-[400px]">
          <h2 className="text-xl font-bold text-white mb-4">Bookings — {currentMonth}</h2>
          {stats?.daily_bookings_chart && (
            <DailyLineChart data={stats.daily_bookings_chart} />
          )}
        </div>
        <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-6 shadow-lg h-[400px]">
          <h2 className="text-xl font-bold text-white mb-4">Monthly Breakdown — {currentYear}</h2>
          {stats?.yearly_breakdown_chart && (
            <MonthlyBarChart data={stats.yearly_breakdown_chart} />
          )}
        </div>
      </section>

    </div>
  );
}
