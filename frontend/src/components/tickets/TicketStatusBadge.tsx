import React from 'react';

type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'closed' | string;

interface TicketStatusBadgeProps {
  status: TicketStatus;
  className?: string;
}

const statusConfig: Record<string, { label: string; bgColor: string; textColor: string; dotColor: string }> = {
  open: {
    label: 'Open',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    dotColor: 'bg-blue-500',
  },
  'in-progress': {
    label: 'In Progress',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    dotColor: 'bg-yellow-500',
  },
  resolved: {
    label: 'Resolved',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    dotColor: 'bg-green-500',
  },
  closed: {
    label: 'Closed',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    dotColor: 'bg-gray-500',
  },
};

const defaultConfig = {
  label: 'Unknown',
  bgColor: 'bg-gray-100',
  textColor: 'text-gray-600',
  dotColor: 'bg-gray-400',
};

const TicketStatusBadge: React.FC<TicketStatusBadgeProps> = ({ status, className = '' }) => {
  const normalizedStatus = status?.toLowerCase().trim();
  const config = statusConfig[normalizedStatus] ?? {
    ...defaultConfig,
    label: status
      ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
      : defaultConfig.label,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} ${className}`}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      <span
        className={`inline-block w-1.5 h-1.5 rounded-full ${config.dotColor} flex-shrink-0`}
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
};

export default TicketStatusBadge;