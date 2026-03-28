import React from 'react';
import { DashboardStats } from '../../types';

interface DashboardResponseTimeWidgetProps {
  stats: DashboardStats | null;
  loading?: boolean;
}

const DashboardResponseTimeWidget: React.FC<DashboardResponseTimeWidgetProps> = ({
  stats,
  loading = false,
}) => {
  const formatResponseTime = (ms: number): string => {
    if (ms < 1000) {
      return `${Math.round(ms)}ms`;
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(1)}s`;
    } else {
      return `${(ms / 60000).toFixed(1)}m`;
    }
  };

  const getPerformanceLevel = (ms: number): { label: string; color: string; bgColor: string; barColor: string } => {
    if (ms < 500) {
      return { label: 'Excellent', color: 'text-emerald-700', bgColor: 'bg-emerald-50', barColor: 'bg-emerald-500' };
    } else if (ms < 1500) {
      return { label: 'Good', color: 'text-blue-700', bgColor: 'bg-blue-50', barColor: 'bg-blue-500' };
    } else if (ms < 3000) {
      return { label: 'Fair', color: 'text-amber-700', bgColor: 'bg-amber-50', barColor: 'bg-amber-500' };
    } else {
      return { label: 'Slow', color: 'text-red-700', bgColor: 'bg-red-50', barColor: 'bg-red-500' };
    }
  };

  const getBarWidth = (ms: number): number => {
    const maxMs = 5000;
    return Math.min((ms / maxMs) * 100, 100);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="flex items-center justify-center mb-6">
            <div className="h-24 w-24 bg-gray-200 rounded-full"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Response Time</h3>
        <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
          No data available
        </div>
      </div>
    );
  }

  const avgMs = stats.avgResponseTimeMs;
  const performance = getPerformanceLevel(avgMs);
  const barWidth = getBarWidth(avgMs);

  const benchmarks = [
    { label: 'Excellent', threshold: '< 500ms', ms: 500 },
    { label: 'Good', threshold: '< 1.5s', ms: 1500 },
    { label: 'Fair', threshold: '< 3s', ms: 3000 },
    { label: 'Slow', threshold: '≥ 3s', ms: Infinity },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold text-gray-800">Avg Response Time</h3>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${performance.bgColor} ${performance.color}`}>
          {performance.label}
        </span>
      </div>

      {/* Main metric display */}
      <div className="flex flex-col items-center mb-6">
        <div className={`flex items-center justify-center w-28 h-28 rounded-full border-4 ${performance.bgColor} border-current ${performance.color} mb-3`}>
          <div className="text-center">
            <div className={`text-2xl font-bold ${performance.color}`}>
              {formatResponseTime(avgMs)}
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500">Average response time</p>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>0ms</span>
          <span>5000ms</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-700 ease-out ${performance.barColor}`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span className="text-emerald-600">Fast</span>
          <span className="text-red-500">Slow</span>
        </div>
      </div>

      {/* Benchmark reference */}
      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">Performance Benchmarks</p>
        <div className="space-y-2">
          {benchmarks.map((benchmark) => {
            const isActive = avgMs < benchmark.ms && (
              benchmark.label === 'Excellent' ? avgMs < 500 :
              benchmark.label === 'Good' ? avgMs >= 500 && avgMs < 1500 :
              benchmark.label === 'Fair' ? avgMs >= 1500 && avgMs < 3000 :
              avgMs >= 3000
            );
            return (
              <div
                key={benchmark.label}
                className={`flex items-center justify-between text-xs rounded-md px-2 py-1 transition-colors ${
                  isActive ? `${performance.bgColor} ${performance.color} font-medium` : 'text-gray-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isActive && (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {!isActive && <span className="w-3 h-3 inline-block" />}
                  <span>{benchmark.label}</span>
                </div>
                <span>{benchmark.threshold}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional context */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">Total Tickets</p>
            <p className="text-lg font-bold text-gray-800">{stats.totalTickets}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">Open Tickets</p>
            <p className="text-lg font-bold text-gray-800">{stats.openTickets}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardResponseTimeWidget;