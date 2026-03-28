import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import NavBar from './components/common/NavBar';
import LoadingSpinner from './components/common/LoadingSpinner';

const ChatPage = React.lazy(() => import('./pages/ChatPage'));
const TicketsPage = React.lazy(() => import('./pages/TicketsPage'));
const TicketDetailPage = React.lazy(() => import('./pages/TicketDetailPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));

const App: React.FC = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <Router>
        <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
          <NavBar />
          <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-64">
                  <LoadingSpinner size="lg" />
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Navigate to="/chat" replace />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/tickets" element={<TicketsPage />} />
                <Route path="/tickets/:ticketId" element={<TicketDetailPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route
                  path="*"
                  element={
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                      <h2 className="text-2xl font-bold text-gray-300">404 — Page Not Found</h2>
                      <p className="text-gray-500">The page you are looking for does not exist.</p>
                      <a
                        href="/chat"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                      >
                        Go to Chat
                      </a>
                    </div>
                  }
                />
              </Routes>
            </Suspense>
          </main>
          <footer className="border-t border-gray-800 py-4 text-center text-sm text-gray-600">
            <p>AI Support Chatbot &copy; {new Date().getFullYear()} — Powered by Google Gemini</p>
          </footer>
        </div>
      </Router>
    </I18nextProvider>
  );
};

export default App;