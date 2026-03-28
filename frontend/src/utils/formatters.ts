export const formatDate = (dateString: string): string => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatDateShort = (dateString: string): string => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const formatRelativeTime = (dateString: string): string => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDateShort(dateString);
};

export const formatResponseTime = (ms: number): string => {
  if (ms === undefined || ms === null || isNaN(ms)) return '—';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.round((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
};

export const formatNumber = (value: number): string => {
  if (value === undefined || value === null || isNaN(value)) return '0';
  return new Intl.NumberFormat('en-US').format(value);
};

export const formatPercentage = (value: number, total: number): string => {
  if (!total || total === 0) return '0%';
  const pct = (value / total) * 100;
  return `${pct.toFixed(1)}%`;
};

export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncate = (str: string, maxLength: number = 80): string => {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}…`;
};

export const formatTicketId = (ticketId: string): string => {
  if (!ticketId) return '—';
  if (ticketId.length > 8) {
    return `#${ticketId.slice(0, 8).toUpperCase()}`;
  }
  return `#${ticketId.toUpperCase()}`;
};

export const formatLanguageLabel = (lang: string): string => {
  const labels: Record<string, string> = {
    en: 'English',
    es: 'Español',
  };
  return labels[lang?.toLowerCase()] ?? lang?.toUpperCase() ?? '—';
};

export const formatSentimentLabel = (sentiment: string): string => {
  const labels: Record<string, string> = {
    positive: 'Positive',
    neutral: 'Neutral',
    negative: 'Negative',
  };
  return labels[sentiment?.toLowerCase()] ?? capitalize(sentiment) ?? '—';
};

export const formatPriorityLabel = (priority: string): string => {
  const labels: Record<string, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
  };
  return labels[priority?.toLowerCase()] ?? capitalize(priority) ?? '—';
};

export const formatStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    open: 'Open',
    'in-progress': 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed',
  };
  return labels[status?.toLowerCase()] ?? capitalize(status) ?? '—';
};