import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboard } from '../../hooks/useDashboard';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  colorClass?: string;
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, colorClass = 'bg-white', icon }) => {
  return (
    <div className={`${colorClass} rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-2`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</span>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <div className="text-3xl font-bold text-gray-800">{value}</div>
      {subtitle && <div className="text-xs text-gray-400">{subtitle}</div>}
    </div>
  );
};

const DashboardStatsCard: React.FC = () => {
  const { t } = useTranslation();
  const { stats, loading, error, refetch } = useDashboard();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorAlert message={error} onRetry={refetch} />;
  }

  if (!stats) {
    return null;
  }

  const avgResponseSec = stats.avgResponseTimeMs
    ? (stats.avgResponseTimeMs / 1000).toFixed(2)
    : '0.00';

  const resolutionRate =
    stats.totalTickets > 0
      ? Math.round((stats.resolvedTickets / stats.totalTickets) * 100)
      : 0;

  const cards: StatCardProps[] = [
    {
      title: t('dashboard.totalTickets', 'Total Tickets'),
      value: stats.totalTickets,
      subtitle: t('dashboard.allTime', 'All time'),
      colorClass: 'bg-white',
      icon: '🎫',
    },
    {
      title: t('dashboard.openTickets', 'Open Tickets'),
      value: stats.openTickets,
      subtitle: t('dashboard.requiresAttention', 'Requires attention'),
      colorClass: 'bg-orange-50',
      icon: '📂',
    },
    {
      title: t('dashboard.resolvedTickets', 'Resolved Tickets'),
      value: stats.resolvedTickets,
      subtitle: `${resolutionRate}% ${t('dashboard.resolutionRate', 'resolution rate')}`,
      colorClass: 'bg-green-50',
      icon: '✅',
    },
    {
      title: t('dashboard.avgResponseTime', 'Avg Response Time'),
      value: `${avgResponseSec}s`,
      subtitle: t('dashboard.perMessage', 'Per message'),
      colorClass: 'bg-blue-50',
      icon: '⚡',
    },
    {
      title: t('dashboard.urgentTickets', 'Urgent Tickets'),
      value: stats.ticketsByPriority?.urgent ?? 0,
      subtitle: t('dashboard.highestPriority', 'Highest priority'),
      colorClass: 'bg-red-50',
      icon: '🚨',
    },
    {
      title: t('dashboard.highPriorityTickets', 'High Priority'),
      value: stats.ticketsByPriority?.high ?? 0,
      subtitle: t('dashboard.needsPromptAction', 'Needs prompt action'),
      colorClass: 'bg-yellow-50',
      icon: '⚠️',
    },
    {
      title: t('dashboard.positivesentiment', 'Positive Sentiment'),
      value: stats.ticketsBySentiment?.positive ?? 0,
      subtitle: t('dashboard.happyCustomers', 'Happy customers'),
      colorClass: 'bg-emerald-50',
      icon: '😊',
    },
    {
      title: t('dashboard.negativesentiment', 'Negative Sentiment'),
      value: stats.ticketsBySentiment?.negative ?? 0,
      subtitle: t('dashboard.needsEmpathy', 'Needs empathy'),
      colorClass: 'bg-pink-50',
      icon: '😟',
    },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-700">
          {t('dashboard.overviewStats', 'Overview Statistics')}
        </h2>
        <button
          onClick={refetch}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          aria-label={t('dashboard.refresh', 'Refresh')}
        >
          ↻ {t('dashboard.refresh', 'Refresh')}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>
    </div>
  );
};

export default DashboardStatsCard;