import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTickets } from '../hooks/useTickets';
import TicketTable from '../components/tickets/TicketTable';
import TicketFilterBar from '../components/tickets/TicketFilterBar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';

export interface TicketFilters {
  status?: string;
  priority?: string;
  category?: string;
  page?: number;
  limit?: number;
}

const TicketsPage: React.FC = () => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<TicketFilters>({
    page: 1,
    limit: 20,
  });

  const { tickets, total, page, limit, loading, error, refetch } = useTickets(filters);

  const handleFilterChange = (newFilters: Partial<TicketFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {t('tickets.title', 'Support Tickets')}
            </h1>
            <p className="mt-1 text-gray-400">
              {t('tickets.subtitle', 'Manage and track all support tickets')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">
              {t('tickets.total', 'Total')}: <span className="text-white font-semibold">{total}</span>
            </span>
            <button
              onClick={refetch}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              <svg
                className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
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
              {t('common.refresh', 'Refresh')}
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-6">
          <TicketFilterBar filters={filters} onFilterChange={handleFilterChange} />
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6">
            <ErrorAlert
              message={error}
              onDismiss={refetch}
            />
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Tickets Table */}
        {!loading && !error && (
          <>
            {tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  {t('tickets.empty.title', 'No tickets found')}
                </h3>
                <p className="text-gray-500 max-w-sm">
                  {t(
                    'tickets.empty.description',
                    'No tickets match your current filters. Try adjusting your search criteria or create a new ticket from the chat.'
                  )}
                </p>
                <Link
                  to="/chat"
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                >
                  {t('tickets.empty.cta', 'Start a Chat')}
                </Link>
              </div>
            ) : (
              <>
                <TicketTable tickets={tickets} onRefresh={refetch} />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-gray-400">
                      {t('tickets.pagination.showing', 'Showing')}{' '}
                      <span className="text-white font-medium">
                        {((page - 1) * limit) + 1}–{Math.min(page * limit, total)}
                      </span>{' '}
                      {t('tickets.pagination.of', 'of')}{' '}
                      <span className="text-white font-medium">{total}</span>{' '}
                      {t('tickets.pagination.tickets', 'tickets')}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page <= 1}
                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-300 text-sm rounded-lg transition-colors duration-200"
                      >
                        {t('common.previous', 'Previous')}
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                          let pageNum: number;
                          if (totalPages <= 7) {
                            pageNum = i + 1;
                          } else if (page <= 4) {
                            pageNum = i + 1;
                          } else if (page >= totalPages - 3) {
                            pageNum = totalPages - 6 + i;
                          } else {
                            pageNum = page - 3 + i;
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`w-8 h-8 text-sm rounded-lg transition-colors duration-200 ${
                                pageNum === page
                                  ? 'bg-indigo-600 text-white font-medium'
                                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page >= totalPages}
                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-300 text-sm rounded-lg transition-colors duration-200"
                      >
                        {t('common.next', 'Next')}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TicketsPage;