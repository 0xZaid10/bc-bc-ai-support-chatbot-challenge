import React from 'react';
import { useTranslation } from 'react-i18next';
import DashboardStatsCard from '../components/dashboard/DashboardStatsCard';
import DashboardPriorityChart from '../components/dashboard/DashboardPriorityChart';
import DashboardSentimentChart from '../components/dashboard/DashboardSentimentChart';
import DashboardLanguageChart from '../components/dashboard/DashboardLanguageChart';
import DashboardResponseTimeWidget from '../components/dashboard/DashboardResponseTimeWidget';
import { useDashboard } from '../hooks/useDashboard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { stats, loading, error, refetch } = useDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <LoadingSpinner size="lg" message={t('dashboard.loading', 'Loading dashboard...')} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorAlert
          message={error}
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('dashboard.title', 'Dashboard')}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {t('dashboard.subtitle', 'Real-time monitoring and analytics')}
            </p>
          </div>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {t('dashboard.refresh', 'Refresh')}
          </button>
        </div>

        {/* Stats Cards Row */}
        <div className="mb-8">
          <DashboardStatsCard stats={stats} />
        </div>

        {/* Response Time Widget */}
        <div className="mb-8">
          <DashboardResponseTimeWidget stats={stats} />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {/* Priority Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {t('dashboard.priorityDistribution', 'Tickets by Priority')}
            </h2>
            <DashboardPriorityChart stats={stats} />
          </div>

          {/* Sentiment Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {t('dashboard.sentimentDistribution', 'Sentiment Analysis')}
            </h2>
            <DashboardSentimentChart stats={stats} />
          </div>

          {/* Language Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2 xl:col-span-1">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {t('dashboard.languageDistribution', 'Tickets by Language')}
            </h2>
            <DashboardLanguageChart stats={stats} />
          </div>
        </div>

        {/* Category Breakdown */}
        {stats && stats.ticketsByCategory && Object.keys(stats.ticketsByCategory).length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {t('dashboard.categoryBreakdown', 'Tickets by Category')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Object.entries(stats.ticketsByCategory).map(([category, count]) => (
                <div
                  key={category}
                  className="flex flex-col items-center justify-center p-4 bg-indigo-50 rounded-lg border border-indigo-100"
                >
                  <span className="text-2xl font-bold text-indigo-700">{count as number}</span>
                  <span className="mt-1 text-xs font-medium text-indigo-500 text-center capitalize">
                    {category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer note */}
        <div className="mt-6 text-center text-xs text-gray-400">
          {t('dashboard.lastUpdated', 'Data refreshes automatically. Click Refresh to update manually.')}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;