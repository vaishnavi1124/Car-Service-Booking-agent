// frontend/src/components/DailyLineChart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, getDaysInMonth, startOfMonth, addDays } from 'date-fns';

interface ChartData {
  [date: string]: number; // e.g., { '2025-11-03': 1, '2025-11-05': 1 }
}

interface DailyLineChartProps {
  data: ChartData;
}

export default function DailyLineChart({ data }: DailyLineChartProps) {
  
  // --- NEW LOGIC TO BUILD A COMPLETE MONTH'S DATA ---

  const chartData = [];
  const today = new Date(); // Get today's date to determine current month
  const firstDayOfMonth = startOfMonth(today);
  const totalDaysInMonth = getDaysInMonth(today);

  for (let i = 0; i < totalDaysInMonth; i++) {
    const currentDay = addDays(firstDayOfMonth, i);
    
    // Key for the x-axis (e.g., "11-03")
    const dayKey = format(currentDay, 'MM-dd');

    // Key to check against the data prop (e.g., "2025-11-03")
    const dataKey = format(currentDay, 'yyyy-MM-dd');

    // Check if data exists for this day, otherwise use 0
    const bookingsCount = data[dataKey] || 0;

    chartData.push({
      day: dayKey,
      bookings: bookingsCount,
    });
  }
  // --- END OF NEW LOGIC ---

  // Check if the entire month has no bookings
  const totalBookings = chartData.reduce((acc, day) => acc + day.bookings, 0);

  if (totalBookings === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        No booking data for this month yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData} // This data is now complete for the whole month
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="day" 
          stroke="#9ca3af" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
          // Show ticks every 2 days to match the "good" picture
          interval={1} 
        />
        <YAxis 
          stroke="#9ca3af" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
          allowDecimals={false}
          // Set the Y-axis ticks to match the "good" picture
          domain={[0, 'dataMax + 1']} // Add padding to the top
          ticks={[0, 1, 2, 3, 4]} // Explicitly define ticks
        />
        <Tooltip
          cursor={{ fill: '#374151' }}
          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.75rem' }}
          labelStyle={{ color: '#d1d5db' }}
        />
        <Line 
          type="monotone" 
          dataKey="bookings" 
          stroke="#818cf8" 
          strokeWidth={2} 
          activeDot={{ r: 8 }} 
          // Add dots on all data points, even 0
          dot={{ r: 3 }} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

