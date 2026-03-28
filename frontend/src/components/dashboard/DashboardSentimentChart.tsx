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
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import { useDashboard } from '../../hooks/useDashboard';

const SENTIMENT_COLORS: Record<string, string> = {
  positive: '#22c55e',
  neutral: '#f59e0b',
  negative: '#ef4444',
};

const RADIAN = Math.PI / 180;

interface CustomLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}

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
      fontSize={12}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: { name: string; value: number };
  }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  const { t } = useTranslation();
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 shadow-lg">
        <p className="text-sm font-semibold text-white capitalize">
          {t(`sentiment.${item.name}`, { defaultValue: item.name })}
        </p>
        <p className="text-sm text-gray-300">
          {t('dashboard.tickets')}: <span className="text-white font-bold">{item.value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const DashboardSentimentChart: React.FC = () => {
  const { t } = useTranslation();
  const { stats, loading, error } = useDashboard();

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 flex items-center justify-center min-h-[320px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 min-h-[320px]">
        <ErrorAlert message={error} />
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const sentimentData = Object.entries(stats.ticketsBySentiment).map(([key, value]) => ({
    name: key,
    value: value as number,
  }));

  const total = sentimentData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">
          {t('dashboard.sentimentDistribution', { defaultValue: 'Sentiment Distribution' })}
        </h3>
        <p className="text-sm text-gray-400 mt-1">
          {t('dashboard.totalAnalyzed', { defaultValue: 'Total analyzed' })}: {total}
        </p>
      </div>

      {total === 0 ? (
        <div className="flex items-center justify-center min-h-[220px]">
          <p className="text-gray-500 text-sm">
            {t('dashboard.noData', { defaultValue: 'No data available' })}
          </p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={90}
                innerRadius={40}
                dataKey="value"
                strokeWidth={2}
                stroke="#1f2937"
              >
                {sentimentData.map((entry) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={SENTIMENT_COLORS[entry.name] ?? '#6b7280'}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value: string) => (
                  <span className="text-gray-300 text-sm capitalize">
                    {t(`sentiment.${value}`, { defaultValue: value })}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {sentimentData.map((item) => (
              <div
                key={item.name}
                className="flex flex-col items-center bg-gray-700 rounded-lg p-3"
              >
                <span
                  className="w-3 h-3 rounded-full mb-1"
                  style={{ backgroundColor: SENTIMENT_COLORS[item.name] ?? '#6b7280' }}
                />
                <span className="text-xs text-gray-400 capitalize">
                  {t(`sentiment.${item.name}`, { defaultValue: item.name })}
                </span>
                <span className="text-lg font-bold text-white">{item.value}</span>
                <span className="text-xs text-gray-500">
                  {total > 0 ? `${((item.value / total) * 100).toFixed(1)}%` : '0%'}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardSentimentChart;