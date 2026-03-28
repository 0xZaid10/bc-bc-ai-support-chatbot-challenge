import React from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageSwitcherProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
  className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  currentLanguage,
  onLanguageChange,
  className = '',
}) => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (lang: string) => {
    onLanguageChange(lang);
    i18n.changeLanguage(lang);
  };

  const languages = [
    { code: 'en', label: 'EN', fullLabel: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'ES', fullLabel: 'Español', flag: '🇪🇸' },
  ];

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          title={lang.fullLabel}
          aria-label={`Switch to ${lang.fullLabel}`}
          aria-pressed={currentLanguage === lang.code}
          className={`
            flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold
            transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400
            ${
              currentLanguage === lang.code
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }
          `}
        >
          <span className="text-sm" role="img" aria-hidden="true">
            {lang.flag}
          </span>
          <span>{lang.label}</span>
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;