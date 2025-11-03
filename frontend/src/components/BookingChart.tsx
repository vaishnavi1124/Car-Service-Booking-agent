// frontend/src/components/BookingChart.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Define the type for the data prop, which is an object with date strings as keys
interface ChartData {
  [date: string]: number;
}

// Define the props for our component
interface BookingChartProps {
  data: ChartData;
}

export default function BookingChart({ data }: BookingChartProps) {
  // Recharts expects an array of objects, so we transform our data.
  // For example, from: { '2025-10-18': 1, '2025-10-21': 2 }
  // To: [ { date: '18', bookings: 1 }, { date: '21', bookings: 2 } ]
  const chartData = Object.entries(data).map(([date, count]) => ({
    // We only show the day of the month on the x-axis for brevity
    date: new Date(date).getDate().toString(), 
    bookings: count,
  }));

  // If there's no data for the month, display a message instead of an empty chart.
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        No booking data for this month yet.
      </div>
    );
  }

  // Render the chart.
  return (
    // ResponsiveContainer makes the chart fill its parent container's dimensions.
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          cursor={{ fill: '#374151' }}
          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.75rem' }}
          labelStyle={{ color: '#d1d5db' }}
        />
        <Bar dataKey="bookings" fill="#818cf8" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}