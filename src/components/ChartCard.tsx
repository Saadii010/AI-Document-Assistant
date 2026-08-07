import React from 'react';
import { motion } from 'motion/react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  loading?: boolean;
  type: 'activity' | 'storage' | 'categories';
  data: any;
  resolvedTheme: 'light' | 'dark';
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  loading = false,
  type,
  data,
  resolvedTheme,
}) => {
  const isDark = resolvedTheme === 'dark';

  // Styles matching the premium aesthetics
  const strokeColor = isDark ? '#27272a' : '#e4e4e7'; // zinc-800 vs zinc-200
  const textColor = isDark ? '#a1a1aa' : '#71717a'; // zinc-400 vs zinc-500
  const primaryColor = isDark ? '#fafafa' : '#18181b'; // white vs zinc-900
  const accentColor = '#6366f1'; // indigo-500
  const warningColor = '#f59e0b'; // amber-500
  const infoColor = '#06b6d4'; // cyan-500

  const PIE_COLORS = [primaryColor, accentColor, infoColor, warningColor, '#10b981'];

  // Custom styled Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg flex flex-col gap-1 text-xs">
          <p className="font-bold text-zinc-900 dark:text-zinc-100">{label}</p>
          {payload.map((item: any, index: number) => (
            <p key={index} className="font-medium" style={{ color: item.color }}>
              {item.name}: <span className="font-bold text-zinc-900 dark:text-zinc-50">{item.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (!data) return null;

    switch (type) {
      case 'activity':
        return (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.monthlyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="month" stroke={textColor} fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke={textColor} fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar name="Uploads" dataKey="uploads" fill={primaryColor} radius={[4, 4, 0, 0]} maxBarSize={30} />
              <Bar name="Chats" dataKey="chats" fill={accentColor} radius={[4, 4, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'storage':
        return (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data.storageUsageTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorStorage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={accentColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke={textColor} fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke={textColor} fontSize={10} tickLine={false} axisLine={false} unit="MB" />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                name="Used Space"
                dataKey="used"
                stroke={accentColor}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorStorage)"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'categories':
        const filteredPie = data.documentTypes?.filter((item: any) => item.value > 0) || [];
        if (filteredPie.length === 0) {
          return (
            <div className="h-[260px] flex items-center justify-center text-xs text-zinc-400">
              No categories mapped yet. Upload files to view chart.
            </div>
          );
        }
        return (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center h-[260px]">
            <div className="md:col-span-6 h-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={filteredPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {filteredPie.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="md:col-span-6 flex flex-col gap-2">
              {filteredPie.map((entry: any, index: number) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                    />
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">{entry.name}</span>
                  </div>
                  <span className="font-mono text-zinc-400 dark:text-zinc-500">
                    {entry.value} file{entry.value > 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="p-6 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-sm flex flex-col gap-4 animate-pulse select-none">
        <div className="flex flex-col gap-1.5">
          <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
          <div className="h-3 w-48 bg-zinc-100 dark:bg-zinc-900 rounded-md" />
        </div>
        <div className="h-[240px] bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-dashed border-zinc-100 dark:border-zinc-900 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-zinc-200 dark:border-zinc-800 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="p-6 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-sm hover:shadow-md transition-all flex flex-col gap-5"
    >
      <div className="flex flex-col gap-0.5 pb-2 border-b border-zinc-100 dark:border-zinc-900">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{title}</h3>
        {subtitle && <p className="text-[11px] text-zinc-400 dark:text-zinc-500 leading-none">{subtitle}</p>}
      </div>
      <div className="w-full">{renderChart()}</div>
    </motion.div>
  );
};
export default ChartCard;
