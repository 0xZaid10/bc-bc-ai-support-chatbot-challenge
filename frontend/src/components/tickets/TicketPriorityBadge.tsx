import React from 'react';

type Priority = 'low' | 'medium' | 'high' | 'urgent';

interface TicketPriorityBadgeProps {
  priority: string;
  className?: string;
}

const priorityConfig: Record<Priority, { label: string; classes: string; dot: string }> = {
  low: {
    label: 'Low',
    classes: 'bg-gray-100 text-gray-700 border border-gray-200',
    dot: 'bg-gray-400',
  },
  medium: {
    label: 'Medium',
    classes: 'bg-blue-50 text-blue-700 border border-blue-200',
    dot: 'bg-blue-500',
  },
  high: {
    label: 'High',
    classes: 'bg-orange-50 text-orange-700 border border-orange-200',
    dot: 'bg-orange-500',
  },
  urgent: {
    label: 'Urgent',
    classes: 'bg-red-50 text-red-700 border border-red-200',
    dot: 'bg-red-500',
  },
};

const TicketPriorityBadge: React.FC<TicketPriorityBadgeProps> = ({ priority, className = '' }) => {
  const normalizedPriority = priority?.toLowerCase() as Priority;
  const config = priorityConfig[normalizedPriority];

  if (!config) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
        {priority || 'Unknown'}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.classes} ${className}`}
      title={`Priority: ${config.label}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} flex-shrink-0`} />
      {config.label}
    </span>
  );
};

export default TicketPriorityBadge;