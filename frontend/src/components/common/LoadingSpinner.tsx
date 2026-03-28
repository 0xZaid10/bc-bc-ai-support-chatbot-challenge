import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  label?: string;
  fullScreen?: boolean;
  className?: string;
}

const sizeMap: Record<string, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-4',
  xl: 'w-16 h-16 border-4',
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'border-indigo-600',
  label,
  fullScreen = false,
  className = '',
}) => {
  const spinnerClasses = `
    inline-block rounded-full border-solid border-gray-200
    border-t-current animate-spin
    ${sizeMap[size] ?? sizeMap.md}
    ${color}
    ${className}
  `.trim();

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={spinnerClasses}
        role="status"
        aria-label={label ?? 'Loading'}
      />
      {label && (
        <p className="text-sm text-gray-500 font-medium animate-pulse">
          {label}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full py-8">
      {spinner}
    </div>
  );
};

export default LoadingSpinner;