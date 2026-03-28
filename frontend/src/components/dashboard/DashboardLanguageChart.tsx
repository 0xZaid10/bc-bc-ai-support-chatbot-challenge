import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { DashboardStats } from '../../types';

interface DashboardLanguageChartProps {
  stats: DashboardStats | null;
  loading?: boolean;
}

const COLORS: Record<string, string> = {
  en: '#6366f1',
  es: '#f59e0b',
};

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  es: 'Español',
};

interface CustomLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: CustomLabelProps) => {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={13}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const DashboardLanguageChart: React.FC<DashboardLanguageChartProps> = ({
  stats,
  loading = false,
}) => {
  const { t } = useTranslation();

  const chartData = React.useMemo(() => {
    if (!stats?.ticketsByLanguage) return [];
    return Object.entries(stats.ticketsByLanguage)
      .map(([lang, count]) => ({
        name: LANGUAGE_LABELS[lang] ?? lang.toUpperCase(),
        value: count as number,
        key: lang,
      }))
      .filter((entry) => entry.value > 0);
  }, [stats]);

  const total = React.useMemo(
    () => chartData.reduce((sum, entry) => sum + entry.value, 0),
    [chartData]
  );

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-40 mb-6" />
          <div className="flex items-center justify-center h-56">
            <div className="w-40 h-40 bg-gray-200 rounded-full" />
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="h-4 bg-gray-200 rounded w-20" />
            <div className="h-4 bg-gray-200 rounded w-20" />
          </div>
        </div>
      </div>
    );
  }

  if (!stats || chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">
          {t('dashboard.languageDistribution', 'Language Distribution')}
        </h3>
        <div className="flex items-center justify-center h-56 text-gray-400 text-sm">
          {t('dashboard.noData', 'No data available')}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-800">
          {t('dashboard.languageDistribution', 'Language Distribution')}
        </h3>
        <span className="text-xs text-gray-400 font-medium">
          {total} {t('dashboard.total', 'total')}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={90}
            innerRadius={40}
            dataKey="value"
            strokeWidth={2}
            stroke="#fff"
          >
            {chartData.map((entry) => (
              <Cell
                key={`cell-${entry.key}`}
                fill={COLORS[entry.key] ?? '#94a3b8'}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [
              `${value} tickets`,
              name,
            ]}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              fontSize: '13px',
            }}
          />
          <Legend
            iconType="circle"
            iconSize={10}
            formatter={(value) => (
              <span style={{ fontSize: '13px', color: '#374151' }}>
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {chartData.map((entry) => (
          <div
            key={entry.key}
            className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2"
          >
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: COLORS[entry.key] ?? '#94a3b8' }}
            />
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-700 truncate">
                {entry.name}
              </p>
              <p className="text-xs text-gray-500">
                {entry.value}{' '}
                {t('dashboard.tickets', 'tickets')} &middot;{' '}
                {total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardLanguageChart;