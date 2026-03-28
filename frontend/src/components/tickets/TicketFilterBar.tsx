import React from 'react';
import { useTranslation } from 'react-i18next';
import { TicketFilters } from '../../types';

interface TicketFilterBarProps {
  filters: TicketFilters;
  onFiltersChange: (filters: TicketFilters) => void;
  onReset: () => void;
}

const TicketFilterBar: React.FC<TicketFilterBarProps> = ({
  filters,
  onFiltersChange,
  onReset,
}) => {
  const { t } = useTranslation();

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    onFiltersChange({
      ...filters,
      [name]: value || undefined,
    });
  };

  const selectClass =
    'block w-full rounded-lg border border-gray-600 bg-gray-700 text-gray-100 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors';

  const labelClass = 'block text-xs font-medium text-gray-400 mb-1';

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        {/* Status Filter */}
        <div className="flex-1 min-w-0">
          <label htmlFor="filter-status" className={labelClass}>
            {t('tickets.filters.status', 'Status')}
          </label>
          <select
            id="filter-status"
            name="status"
            value={filters.status ?? ''}
            onChange={handleChange}
            className={selectClass}
          >
            <option value="">{t('tickets.filters.allStatuses', 'All Statuses')}</option>
            <option value="open">{t('tickets.status.open', 'Open')}</option>
            <option value="in-progress">{t('tickets.status.inProgress', 'In Progress')}</option>
            <option value="resolved">{t('tickets.status.resolved', 'Resolved')}</option>
            <option value="closed">{t('tickets.status.closed', 'Closed')}</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="flex-1 min-w-0">
          <label htmlFor="filter-priority" className={labelClass}>
            {t('tickets.filters.priority', 'Priority')}
          </label>
          <select
            id="filter-priority"
            name="priority"
            value={filters.priority ?? ''}
            onChange={handleChange}
            className={selectClass}
          >
            <option value="">{t('tickets.filters.allPriorities', 'All Priorities')}</option>
            <option value="low">{t('tickets.priority.low', 'Low')}</option>
            <option value="medium">{t('tickets.priority.medium', 'Medium')}</option>
            <option value="high">{t('tickets.priority.high', 'High')}</option>
            <option value="urgent">{t('tickets.priority.urgent', 'Urgent')}</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex-1 min-w-0">
          <label htmlFor="filter-category" className={labelClass}>
            {t('tickets.filters.category', 'Category')}
          </label>
          <select
            id="filter-category"
            name="category"
            value={filters.category ?? ''}
            onChange={handleChange}
            className={selectClass}
          >
            <option value="">{t('tickets.filters.allCategories', 'All Categories')}</option>
            <option value="billing">{t('tickets.category.billing', 'Billing')}</option>
            <option value="technical">{t('tickets.category.technical', 'Technical')}</option>
            <option value="account">{t('tickets.category.account', 'Account')}</option>
            <option value="general">{t('tickets.category.general', 'General')}</option>
            <option value="shipping">{t('tickets.category.shipping', 'Shipping')}</option>
            <option value="returns">{t('tickets.category.returns', 'Returns')}</option>
            <option value="other">{t('tickets.category.other', 'Other')}</option>
          </select>
        </div>

        {/* Sentiment Filter */}
        <div className="flex-1 min-w-0">
          <label htmlFor="filter-sentiment" className={labelClass}>
            {t('tickets.filters.sentiment', 'Sentiment')}
          </label>
          <select
            id="filter-sentiment"
            name="sentiment"
            value={(filters as Record<string, string | undefined>).sentiment ?? ''}
            onChange={handleChange}
            className={selectClass}
          >
            <option value="">{t('tickets.filters.allSentiments', 'All Sentiments')}</option>
            <option value="positive">{t('tickets.sentiment.positive', 'Positive')}</option>
            <option value="neutral">{t('tickets.sentiment.neutral', 'Neutral')}</option>
            <option value="negative">{t('tickets.sentiment.negative', 'Negative')}</option>
          </select>
        </div>

        {/* Reset Button */}
        <div className="flex-shrink-0">
          <button
            type="button"
            onClick={onReset}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white text-sm font-medium border border-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {t('tickets.filters.reset', 'Reset')}
          </button>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(filters.status || filters.priority || filters.category) && (
        <div className="mt-3 pt-3 border-t border-gray-700 flex flex-wrap gap-2">
          <span className="text-xs text-gray-400 self-center">
            {t('tickets.filters.active', 'Active filters:')}
          </span>
          {filters.status && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-900/50 text-indigo-300 text-xs border border-indigo-700">
              {t('tickets.filters.status', 'Status')}: {filters.status}
              <button
                type="button"
                onClick={() => onFiltersChange({ ...filters, status: undefined })}
                className="ml-0.5 hover:text-white transition-colors"
                aria-label={`Remove status filter`}
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </span>
          )}
          {filters.priority && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-900/50 text-indigo-300 text-xs border border-indigo-700">
              {t('tickets.filters.priority', 'Priority')}: {filters.priority}
              <button
                type="button"
                onClick={() => onFiltersChange({ ...filters, priority: undefined })}
                className="ml-0.5 hover:text-white transition-colors"
                aria-label={`Remove priority filter`}
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </span>
          )}
          {filters.category && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-900/50 text-indigo-300 text-xs border border-indigo-700">
              {t('tickets.filters.category', 'Category')}: {filters.category}
              <button
                type="button"
                onClick={() => onFiltersChange({ ...filters, category: undefined })}
                className="ml-0.5 hover:text-white transition-colors"
                aria-label={`Remove category filter`}
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default TicketFilterBar;