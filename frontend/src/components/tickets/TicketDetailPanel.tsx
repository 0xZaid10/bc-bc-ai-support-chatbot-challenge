import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Ticket } from '../../types';
import { getTicketById, updateTicket, reclassifyTicket } from '../../services/ticketsApi';
import TicketStatusBadge from './TicketStatusBadge';
import TicketPriorityBadge from './TicketPriorityBadge';
import TicketCategoryTag from './TicketCategoryTag';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';

interface TicketDetailPanelProps {
  ticketId: string;
  onClose?: () => void;
  onUpdated?: (ticket: Ticket) => void;
}

const TicketDetailPanel: React.FC<TicketDetailPanelProps> = ({ ticketId, onClose, onUpdated }) => {
  const { t } = useTranslation();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [reclassifying, setReclassifying] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (ticketId) {
      fetchTicket();
    }
  }, [ticketId]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTicketById(ticketId);
      setTicket(data);
      setSelectedStatus(data.status);
      setSelectedPriority(data.priority);
    } catch (err: any) {
      setError(err.message || t('errors.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!ticket) return;
    try {
      setUpdating(true);
      setUpdateError(null);
      setSuccessMessage(null);
      const updated = await updateTicket(ticketId, {
        status: selectedStatus !== ticket.status ? selectedStatus : undefined,
        priority: selectedPriority !== ticket.priority ? selectedPriority : undefined,
        notes: notes.trim() || undefined,
      });
      const refreshed = await getTicketById(ticketId);
      setTicket(refreshed);
      setSelectedStatus(refreshed.status);
      setSelectedPriority(refreshed.priority);
      setNotes('');
      setSuccessMessage(t('tickets.updateSuccess'));
      if (onUpdated) onUpdated(refreshed);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setUpdateError(err.message || t('errors.updateFailed'));
    } finally {
      setUpdating(false);
    }
  };

  const handleReclassify = async () => {
    if (!ticket) return;
    try {
      setReclassifying(true);
      setUpdateError(null);
      setSuccessMessage(null);
      await reclassifyTicket(ticketId);
      const refreshed = await getTicketById(ticketId);
      setTicket(refreshed);
      setSelectedStatus(refreshed.status);
      setSelectedPriority(refreshed.priority);
      setSuccessMessage(t('tickets.reclassifySuccess'));
      if (onUpdated) onUpdated(refreshed);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setUpdateError(err.message || t('errors.reclassifyFailed'));
    } finally {
      setReclassifying(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'negative':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return '😊';
      case 'negative':
        return '😞';
      default:
        return '😐';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <ErrorAlert message={error} onDismiss={() => setError(null)} />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>{t('tickets.notFound')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t('tickets.ticketDetail')}</h2>
            <p className="text-sm text-gray-500 font-mono">#{ticket.ticketId}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white transition-colors"
            aria-label={t('common.close')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Success / Error Messages */}
        {successMessage && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {successMessage}
          </div>
        )}
        {updateError && (
          <ErrorAlert message={updateError} onDismiss={() => setUpdateError(null)} />
        )}

        {/* Classification Badges */}
        <div className="flex flex-wrap gap-2 items-center">
          <TicketStatusBadge status={ticket.status} />
          <TicketPriorityBadge priority={ticket.priority} />
          <TicketCategoryTag category={ticket.category} />
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getSentimentColor(ticket.sentiment)}`}>
            <span>{getSentimentIcon(ticket.sentiment)}</span>
            {ticket.sentiment}
          </span>
          {ticket.language && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              🌐 {ticket.language.toUpperCase()}
            </span>
          )}
        </div>

        {/* Message */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">{t('tickets.message')}</h3>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{ticket.message}</p>
          </div>
        </div>

        {/* Auto Response */}
        {ticket.autoResponse && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">{t('tickets.autoResponse')}</h3>
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-indigo-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
                  </svg>
                </div>
                <p className="text-indigo-800 text-sm leading-relaxed whitespace-pre-wrap">{ticket.autoResponse}</p>
              </div>
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{t('tickets.createdAt')}</p>
            <p className="text-sm text-gray-700">{formatDate(ticket.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{t('tickets.updatedAt')}</p>
            <p className="text-sm text-gray-700">{formatDate(ticket.updatedAt)}</p>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-200" />

        {/* Update Form */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">{t('tickets.updateTicket')}</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Status Select */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">{t('tickets.status')}</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                >
                  <option value="open">{t('tickets.statusOpen')}</option>
                  <option value="in-progress">{t('tickets.statusInProgress')}</option>
                  <option value="resolved">{t('tickets.statusResolved')}</option>
                  <option value="closed">{t('tickets.statusClosed')}</option>
                </select>
              </div>

              {/* Priority Select */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">{t('tickets.priority')}</label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                >
                  <option value="low">{t('tickets.priorityLow')}</option>
                  <option value="medium">{t('tickets.priorityMedium')}</option>
                  <option value="high">{t('tickets.priorityHigh')}</option>
                  <option value="urgent">{t('tickets.priorityUrgent')}</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">{t('tickets.notes')}</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('tickets.notesPlaceholder')}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleUpdate}
                disabled={updating || reclassifying}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {updating ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t('common.saving')}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('tickets.saveChanges')}
                  </>
                )}
              </button>

              <button
                onClick={handleReclassify}
                disabled={updating || reclassifying}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={t('tickets.reclassifyTooltip')}
              >
                {reclassifying ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t('tickets.reclassifying')}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {t('tickets.reclassify')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPanel;