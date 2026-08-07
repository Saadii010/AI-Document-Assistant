import React from 'react';
import { motion } from 'motion/react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface ChartCardProps {
  id: string;
  title: string;
  description?: string;
  type: 'area' | 'bar' | 'pie' | 'double-bar';
  data: any[];
  keys: string[];
  colors: string[];
  labels?: string[];
}

export const ChartCard: React.FC<ChartCardProps> = ({
  id,
  title,
  description,
  type,
  data,
  keys,
  colors,
  labels,
}) => {
  const isDark = document.documentElement.classList.contains('dark');
  const strokeColor = isDark ? '#27272a' : '#f4f4f5';
  const textColor = isDark ? '#71717a' : '#a1a1aa';

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 rounded-2xl bg-white border border-zinc-200/80 dark:bg-zinc-950 dark:border-zinc-800/80 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] flex flex-col justify-between"
    >
      <div className="mb-4">
        <h4 className="text-sm font-black text-zinc-800 dark:text-zinc-200 tracking-tight">
          {title}
        </h4>
        {description && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
            {description}
          </p>
        )}
      </div>

      <div className="w-full h-64 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'area' ? (
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${keys[0]}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[0]} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={colors[0]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={strokeColor} />
              <XAxis
                dataKey="name"
                stroke={textColor}
                fontSize={10}
                fontWeight="bold"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke={textColor}
                fontSize={10}
                fontWeight="bold"
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#09090b' : '#ffffff',
                  borderColor: isDark ? '#27272a' : '#e4e4e7',
                  borderRadius: '12px',
                  color: isDark ? '#f4f4f5' : '#18181b',
                  fontSize: '11px',
                  fontWeight: 'bold',
                }}
              />
              <Area
                type="monotone"
                dataKey={keys[0]}
                stroke={colors[0]}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#grad-${keys[0]})`}
              />
            </AreaChart>
          ) : type === 'bar' ? (
            <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={strokeColor} />
              <XAxis
                dataKey="name"
                stroke={textColor}
                fontSize={10}
                fontWeight="bold"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke={textColor}
                fontSize={10}
                fontWeight="bold"
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#09090b' : '#ffffff',
                  borderColor: isDark ? '#27272a' : '#e4e4e7',
                  borderRadius: '12px',
                  color: isDark ? '#f4f4f5' : '#18181b',
                  fontSize: '11px',
                  fontWeight: 'bold',
                }}
              />
              <Bar dataKey={keys[0]} fill={colors[0]} radius={[6, 6, 0, 0]} />
            </BarChart>
          ) : type === 'double-bar' ? (
            <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={strokeColor} />
              <XAxis
                dataKey="name"
                stroke={textColor}
                fontSize={10}
                fontWeight="bold"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke={textColor}
                fontSize={10}
                fontWeight="bold"
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#09090b' : '#ffffff',
                  borderColor: isDark ? '#27272a' : '#e4e4e7',
                  borderRadius: '12px',
                  color: isDark ? '#f4f4f5' : '#18181b',
                  fontSize: '11px',
                  fontWeight: 'bold',
                }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
              <Bar name={labels?.[0] || keys[0]} dataKey={keys[0]} fill={colors[0]} radius={[4, 4, 0, 0]} />
              <Bar name={labels?.[1] || keys[1]} dataKey={keys[1]} fill={colors[1]} radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#09090b' : '#ffffff',
                  borderColor: isDark ? '#27272a' : '#e4e4e7',
                  borderRadius: '12px',
                  color: isDark ? '#f4f4f5' : '#18181b',
                  fontSize: '11px',
                  fontWeight: 'bold',
                }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
