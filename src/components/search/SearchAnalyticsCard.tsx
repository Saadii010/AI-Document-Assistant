import React from 'react';
import { ISearchStats } from './types';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { 
  Sparkles, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Inbox, 
  BarChart3 
} from 'lucide-react';

interface SearchAnalyticsCardProps {
  stats: ISearchStats;
}

export const SearchAnalyticsCard: React.FC<SearchAnalyticsCardProps> = ({ stats }) => {
  // If no searches have occurred yet, show a clean empty analytics state
  if (!stats || stats.totalSearches === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-3 shadow-sm min-h-[300px]">
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/40 dark:border-zinc-800/40 text-zinc-400">
          <Inbox className="w-8 h-8" />
        </div>
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">No Search Analytics Yet</h3>
        <p className="text-xs text-zinc-500 max-w-sm">
          Analytics are recorded dynamically as you search your knowledge base. Perform a search to see reports.
        </p>
      </div>
    );
  }

  // Formatting topics for recharts BarChart
  const barChartData = stats.popularTopics.map((item) => ({
    name: item.topic.length > 20 ? item.topic.substring(0, 18) + '...' : item.topic,
    searches: item.count,
  }));

  // Success vs Failure for PieChart
  const pieChartData = [
    { name: 'Successful', value: stats.successRate },
    { name: 'No Results', value: 100 - stats.successRate },
  ];

  const COLORS = ['#27272a', '#a1a1aa']; // sleek modern gray scale
  const DARK_COLORS = ['#fafafa', '#52525b'];

  return (
    <div className="space-y-6">
      
      {/* 1. Main Numeric Metric Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Metric 1: Total volume */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/40 dark:border-zinc-800/45 text-zinc-800 dark:text-zinc-200 shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-extrabold tracking-wider text-zinc-400 dark:text-zinc-500">Total Searches</p>
            <h4 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-0.5">{stats.totalSearches}</h4>
          </div>
        </div>

        {/* Metric 2: Speed */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/40 dark:border-zinc-800/45 text-zinc-800 dark:text-zinc-200 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-extrabold tracking-wider text-zinc-400 dark:text-zinc-500">Avg. Response Time</p>
            <h4 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-0.5">{stats.avgResponseTimeMs} ms</h4>
          </div>
        </div>

        {/* Metric 3: Success Rate */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/40 dark:border-zinc-800/45 text-zinc-800 dark:text-zinc-200 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-extrabold tracking-wider text-zinc-400 dark:text-zinc-500">Success Rate</p>
            <h4 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-0.5">{stats.successRate}%</h4>
          </div>
        </div>
      </div>

      {/* 2. Graphical Charts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Popular Topics (Bar Chart) */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Most Searched Topics</h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Frequency of your semantic and keyword search terms.</p>
          </div>
          <div className="h-64 w-full text-xs font-semibold">
            {barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={barChartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={10} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      background: 'rgb(24, 24, 27)', 
                      color: 'white', 
                      fontSize: '11px',
                      border: 'none' 
                    }} 
                  />
                  <Bar dataKey="searches" fill="currentColor" className="text-zinc-900 dark:text-zinc-200" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-400 text-xs">No topic logs found.</div>
            )}
          </div>
        </div>

        {/* Success Rate distribution (Pie Chart) */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Search Resolution</h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Proportion of queries returning relevant document chunks.</p>
          </div>
          <div className="h-64 w-full flex items-center justify-center relative">
            <div className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={document.documentElement.classList.contains('dark') ? DARK_COLORS[index] : COLORS[index]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                  <Legend verticalAlign="bottom" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Centered Percentage metric */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-36px]">
              <span className="text-xl font-black text-zinc-800 dark:text-zinc-100">{stats.successRate}%</span>
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-400 dark:text-zinc-500">Success</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Empty Results terms */}
      {stats.zeroResultQueries && stats.zeroResultQueries.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3 text-left">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-zinc-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Missed Intent Queries (Zero Results)</h4>
          </div>
          <p className="text-[11px] text-zinc-500">These search terms yielded no matching document chunks or title references. Consider indexing additional files on these subjects.</p>
          <div className="flex flex-wrap gap-2 pt-1">
            {stats.zeroResultQueries.map((query, i) => (
              <span
                key={i}
                className="bg-zinc-100 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-zinc-200/40 dark:border-zinc-800/40"
              >
                "{query}"
              </span>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
