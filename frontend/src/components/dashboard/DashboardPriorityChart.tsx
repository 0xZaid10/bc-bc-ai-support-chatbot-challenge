import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { DashboardStats } from '../../types';

interface DashboardPriorityChartProps {
  stats: DashboardStats | null;
  loading?: boolean;
}

const PRIORITY_COLORS: Record<string, string> = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#ef4444',
  urgent: '#7c3aed',
};

const DashboardPriorityChart: React.FC<DashboardPriorityChartProps> = ({
  stats,
  loading = false,
}) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-40 mb-6" />
          <div className="h-64 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-700 mb-4">
          {t('dashboard.priorityChart', 'Tickets by Priority')}
        </h3>
        <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
          {t('common.noData', 'No data available')}
        </div>
      </div>
    );
  }

  const chartData = [
    {
      name: t('priority.low', 'Low'),
      value: stats.ticketsByPriority.low,
      key: 'low',
    },
    {
      name: t('priority.medium', 'Medium'),
      value: stats.ticketsByPriority.medium,
      key: 'medium',
    },
    {
      name: t('priority.high', 'High'),
      value: stats.ticketsByPriority.high,
      key: 'high',
    },
    {
      name: t('priority.urgent', 'Urgent'),
      value: stats.ticketsByPriority.urgent,
      key: 'urgent',
    },
  ];

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  interface TooltipPayloadItem {
    value: number;
    name: string;
    payload: { key: string; name: string; value: number };
  }

  interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayloadItem[];
    label?: string;
  }

  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="text-sm font-semibold text-gray-800 mb-1">{label}</p>
          <p className="text-sm text-gray-600">
            {t('dashboard.tickets', 'Tickets')}:{' '}
            <span className="font-bold text-gray-900">{item.value}</span>
          </p>
          <p className="text-sm text-gray-600">
            {t('dashboard.percentage', 'Percentage')}:{' '}
            <span className="font-bold text-gray-900">{percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold text-gray-700">
          {t('dashboard.priorityChart', 'Tickets by Priority')}
        </h3>
        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
          {t('dashboard.total', 'Total')}: {total}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={chartData}
          margin={{ top: 4, right: 8, left: -16, bottom: 4 }}
          barCategoryGap="30%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={56}>
            {chartData.map((entry) => (
              <Cell
                key={entry.key}
                fill={PRIORITY_COLORS[entry.key] ?? '#94a3b8'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {chartData.map((item) => (
          <div
            key={item.key}
            className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2"
          >
            <span
              className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: PRIORITY_COLORS[item.key] ?? '#94a3b8' }}
            />
            <div className="min-w-0">
              <p className="text-xs text-gray-500 truncate">{item.name}</p>
              <p className="text-sm font-bold text-gray-800">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPriorityChart;