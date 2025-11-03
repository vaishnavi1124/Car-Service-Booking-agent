// frontend/src/components/MonthlyBarChart.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// This component is for the yearly breakdown (right chart)

interface ChartData {
  month: string;
  bookings: number;
  cancellations: number;
}

interface MonthlyBarChartProps {
  data: ChartData[];
}

export default function MonthlyBarChart({ data }: MonthlyBarChartProps) {

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          cursor={{ fill: '#374151' }}
          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.75rem' }}
          labelStyle={{ color: '#d1d5db' }}
        />
        <Legend wrapperStyle={{ fontSize: '14px' }} />
        <Bar dataKey="bookings" fill="#818cf8" radius={[4, 4, 0, 0]} />
        <Bar dataKey="cancellations" fill="#f43f5e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}