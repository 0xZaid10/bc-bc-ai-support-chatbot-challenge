import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TicketDetailPanel from '../components/tickets/TicketDetailPanel';
import NavBar from '../components/common/NavBar';

const TicketDetailPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!ticketId) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <NavBar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <p className="text-red-400 text-lg mb-4">{t('tickets.notFound', 'Ticket not found')}</p>
            <button
              onClick={() => navigate('/tickets')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition-colors"
            >
              {t('tickets.backToTickets', 'Back to Tickets')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <NavBar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate('/tickets')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('tickets.backToTickets', 'Back to Tickets')}
          </button>
          <span className="text-gray-600">/</span>
          <span className="text-gray-300 text-sm font-mono">{ticketId}</span>
        </div>

        <TicketDetailPanel ticketId={ticketId} />
      </div>
    </div>
  );
};

export default TicketDetailPage;