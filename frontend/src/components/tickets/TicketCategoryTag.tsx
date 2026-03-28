import React from 'react';

interface TicketCategoryTagProps {
  category: string;
  className?: string;
}

const categoryStyles: Record<string, { bg: string; text: string; border: string }> = {
  billing: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
  technical: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  account: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
  },
  shipping: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
  },
  returns: {
    bg: 'bg-pink-50',
    text: 'text-pink-700',
    border: 'border-pink-200',
  },
  general: {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
  },
  sales: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
  },
  support: {
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200',
  },
  feedback: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
  },
  security: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
  },
};

const defaultStyle = {
  bg: 'bg-slate-50',
  text: 'text-slate-700',
  border: 'border-slate-200',
};

const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    billing: '💳',
    technical: '🔧',
    account: '👤',
    shipping: '📦',
    returns: '↩️',
    general: '💬',
    sales: '💰',
    support: '🎧',
    feedback: '⭐',
    security: '🔒',
  };
  return icons[category.toLowerCase()] ?? '🏷️';
};

const formatCategoryLabel = (category: string): string => {
  return category
    .split(/[_\-\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const TicketCategoryTag: React.FC<TicketCategoryTagProps> = ({ category, className = '' }) => {
  const normalizedCategory = category?.toLowerCase() ?? 'general';
  const style = categoryStyles[normalizedCategory] ?? defaultStyle;
  const icon = getCategoryIcon(normalizedCategory);
  const label = formatCategoryLabel(category ?? 'General');

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2.5 py-1
        text-xs font-medium rounded-full border
        ${style.bg} ${style.text} ${style.border}
        whitespace-nowrap select-none
        ${className}
      `}
      title={`Category: ${label}`}
    >
      <span className="text-xs leading-none" aria-hidden="true">
        {icon}
      </span>
      <span>{label}</span>
    </span>
  );
};

export default TicketCategoryTag;