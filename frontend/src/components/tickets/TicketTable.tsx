import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket } from '../../types';
import TicketStatusBadge from './TicketStatusBadge';
import TicketPriorityBadge from './TicketPriorityBadge';
import TicketCategoryTag from './TicketCategoryTag';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import { formatDate } from '../../utils/formatters';
import { useTranslation } from 'react-i18next';

interface TicketTableProps {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
}

const TicketTable: React.FC<TicketTableProps> = ({
  tickets,
  loading,
  error,
  total,
  page,
  limit,
  onPageChange,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const totalPages = Math.ceil(total / limit);

  const handleRowClick = (ticketId: string) => {
    navigate(`/tickets/${ticketId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <svg
          className="w-16 h-16 mb-4 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-lg font-medium">{t('tickets.noTickets', 'No tickets found')}</p>
        <p className="text-sm mt-1">{t('tickets.noTicketsDesc', 'Try adjusting your filters or create a new ticket.')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                {t('tickets.table.id', 'Ticket ID')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                {t('tickets.table.message', 'Message')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                {t('tickets.table.status', 'Status')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                {t('tickets.table.priority', 'Priority')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                {t('tickets.table.category', 'Category')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                {t('tickets.table.language', 'Lang')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                {t('tickets.table.sentiment', 'Sentiment')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                {t('tickets.table.createdAt', 'Created')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {tickets.map((ticket) => (
              <tr
                key={ticket.ticketId}
                onClick={() => handleRowClick(ticket.ticketId)}
                className="hover:bg-indigo-50 cursor-pointer transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                    {ticket.ticketId.slice(0, 8)}…
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-800 max-w-xs truncate" title={ticket.message}>
                    {ticket.message}
                  </p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <TicketStatusBadge status={ticket.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <TicketPriorityBadge priority={ticket.priority} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <TicketCategoryTag category={ticket.category} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 uppercase">
                    {ticket.language}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <SentimentIndicator sentiment={ticket.sentiment} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(ticket.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-gray-600">
            {t('tickets.pagination.showing', 'Showing')}{' '}
            <span className="font-medium">{(page - 1) * limit + 1}</span>
            {' – '}
            <span className="font-medium">{Math.min(page * limit, total)}</span>{' '}
            {t('tickets.pagination.of', 'of')}{' '}
            <span className="font-medium">{total}</span>{' '}
            {t('tickets.pagination.tickets', 'tickets')}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {t('tickets.pagination.prev', 'Previous')}
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                  acc.push('ellipsis');
                }
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) =>
                item === 'ellipsis' ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => onPageChange(item as number)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                      page === item
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {t('tickets.pagination.next', 'Next')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const SentimentIndicator: React.FC<{ sentiment: string }> = ({ sentiment }) => {
  const config: Record<string, { emoji: string; className: string }> = {
    positive: { emoji: '😊', className: 'bg-green-50 text-green-700' },
    neutral: { emoji: '😐', className: 'bg-gray-100 text-gray-600' },
    negative: { emoji: '😞', className: 'bg-red-50 text-red-700' },
  };

  const { emoji, className } = config[sentiment] ?? config['neutral'];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium capitalize ${className}`}
    >
      <span>{emoji}</span>
      {sentiment}
    </span>
  );
};

export default TicketTable;