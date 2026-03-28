import { DetectedLanguage } from '../types/index';

interface FallbackResponse {
  reply: string;
  detectedLanguage: DetectedLanguage;
}

interface FallbackClassification {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

const FALLBACK_MESSAGES: Record<DetectedLanguage, string> = {
  en: "I'm sorry, I'm experiencing technical difficulties right now. Please try again in a moment, or contact our support team directly for immediate assistance.",
  es: 'Lo siento, estoy experimentando dificultades técnicas en este momento. Por favor, inténtelo de nuevo en un momento, o contacte a nuestro equipo de soporte directamente para obtener asistencia inmediata.',
};

const FALLBACK_CLASSIFICATION: FallbackClassification = {
  priority: 'medium',
  category: 'general',
  sentiment: 'neutral',
};

export function getFallbackChatResponse(language?: string): FallbackResponse {
  const detectedLanguage: DetectedLanguage = normalizeLanguage(language);
  return {
    reply: FALLBACK_MESSAGES[detectedLanguage],
    detectedLanguage,
  };
}

export function getFallbackClassification(): FallbackClassification {
  return { ...FALLBACK_CLASSIFICATION };
}

export function getFallbackLanguageDetection(message: string): DetectedLanguage {
  const spanishPattern =
    /\b(hola|gracias|por favor|ayuda|problema|necesito|tengo|quiero|puedo|cómo|qué|dónde|cuándo|es|está|estoy|tiene|hacer|favor|buenos|días|tardes|noches|sí|no)\b/i;

  if (spanishPattern.test(message)) {
    return 'es';
  }

  return 'en';
}

export function normalizeLanguage(language?: string): DetectedLanguage {
  if (!language) return 'en';
  const normalized = language.toLowerCase().trim();
  if (normalized === 'es' || normalized.startsWith('es-')) return 'es';
  return 'en';
}

export function getFallbackAutoResponse(
  category: string,
  language: DetectedLanguage
): string {
  const responses: Record<string, Record<DetectedLanguage, string>> = {
    billing: {
      en: 'Thank you for contacting us about a billing issue. Our billing team will review your case and respond within 24 hours.',
      es: 'Gracias por contactarnos sobre un problema de facturación. Nuestro equipo de facturación revisará su caso y responderá dentro de 24 horas.',
    },
    bug: {
      en: 'Thank you for reporting this issue. Our technical team has been notified and will investigate the problem promptly.',
      es: 'Gracias por reportar este problema. Nuestro equipo técnico ha sido notificado e investigará el problema de inmediato.',
    },
    feature: {
      en: 'Thank you for your feature request. We appreciate your feedback and will consider it for future updates.',
      es: 'Gracias por su solicitud de función. Apreciamos sus comentarios y los consideraremos para futuras actualizaciones.',
    },
    account: {
      en: 'Thank you for reaching out about your account. Our support team will assist you with your account-related issue shortly.',
      es: 'Gracias por comunicarse sobre su cuenta. Nuestro equipo de soporte le ayudará con su problema relacionado con la cuenta en breve.',
    },
    general: {
      en: 'Thank you for contacting support. A member of our team will review your request and get back to you as soon as possible.',
      es: 'Gracias por contactar al soporte. Un miembro de nuestro equipo revisará su solicitud y se comunicará con usted lo antes posible.',
    },
  };

  const categoryKey = category.toLowerCase();
  const categoryResponses = responses[categoryKey] ?? responses['general'];
  return categoryResponses[language] ?? categoryResponses['en'];
}