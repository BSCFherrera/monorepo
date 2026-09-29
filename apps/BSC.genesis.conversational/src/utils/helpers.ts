import {DOCUMENT_CATEGORY} from '@constants/documentCategory';

/**
 * Formatear fecha a string legible
 */
export const formatDate = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return 'Hace un momento';
  } else if (minutes < 60) {
    return `Hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  } else if (hours < 24) {
    return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  } else if (days === 1) {
    return 'Ayer';
  } else if (days < 7) {
    return `Hace ${days} días`;
  } else {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());
    return `${day}/${month}/${year}`;
  }
};

/**
 * Formatear hora a string HH:MM
 */
export const formatTime = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Formatear monto a moneda
 */
export const formatCurrency = (amount: number, currency: string = 'DOP'): string => {
  const symbolMap: Record<string, string> = {
    BOB: 'Bs',
    DOP: 'RD$',
    USD: 'US$',
  };

  const symbol = symbolMap[currency] ?? `${currency}`;
  const absAmount = Math.abs(amount);
  const [intPart, decimalPart] = absAmount.toFixed(2).split('.');
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const sign = amount < 0 ? '-' : '';

  return `${sign}${symbol} ${withThousands}.${decimalPart}`;
};

/**
 * Validar email
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validar teléfono (Bolivia)
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[67]\d{7}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

/**
 * Niveles de fortaleza de contraseña
 */
export type PasswordStrengthLevel = 'weak' | 'medium' | 'strong';

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 20;

// Longitud máxima estándar de un email (RFC 5321).
export const EMAIL_MAX_LENGTH = 254;

/**
 * Evalúa la fortaleza de una contraseña (Débil, Media, Fuerte) según criterios estándar:
 * longitud, uso de mayúsculas, minúsculas, números y símbolos.
 */
export const getPasswordStrength = (password: string): PasswordStrengthLevel => {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return 'weak';
  }

  let score = 0;
  if (password.length >= 12) {
    score += 1;
  }
  if (/[a-z]/.test(password)) {
    score += 1;
  }
  if (/[A-Z]/.test(password)) {
    score += 1;
  }
  if (/[0-9]/.test(password)) {
    score += 1;
  }
  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1;
  }

  if (score <= 2) {
    return 'weak';
  }
  if (score <= 3) {
    return 'medium';
  }
  return 'strong';
};

/**
 * Valida que el usuario sea una cédula (11 dígitos) o un pasaporte (6-12 caracteres alfanuméricos)
 */
export const isValidCedulaOrPassport = (value: string): boolean => {
  if (/^[0-9]+$/.test(value)) {
    return value.length === 11;
  }
  return /^[a-zA-Z0-9]{6,12}$/.test(value);
};

/**
 * Generar ID único
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Truncar texto
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Capitalizar primera letra
 */
export const capitalize = (text: string): string => {
  if (!text) {
    return '';
  }
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Ocultar número de cuenta (mostrar solo últimos 4 dígitos)
 */
export const maskAccountNumber = (accountNumber: string): string => {
  if (accountNumber.length <= 4) {
    return accountNumber;
  }
  const lastFour = accountNumber.slice(-4);
  const masked = '*'.repeat(accountNumber.length - 4);
  return `${masked}${lastFour}`;
};

/**
 * Delay/Sleep
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Enmascara el correo dejando visibles los primeros y últimos caracteres del usuario
 */
export const maskEmail = (email: string): string => {
  const [localPart, domain] = email.split('@');

  if (!domain) {
    return email;
  }

  if (localPart.length <= 5) {
    return `${localPart.charAt(0)}${'*'.repeat(Math.max(localPart.length - 1, 1))}@${domain}`;
  }

  const visibleStart = localPart.substring(0, 3);
  const visibleEnd = localPart.substring(localPart.length - 2);
  return `${visibleStart}*****${visibleEnd}@${domain}`;
};

/**
 * Formatea el nombre para que solo la primera letra sea mayúscula
 */
export const formatName = (name: string): string =>
  name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

/**
 * Enmascara el teléfono dejando visible el código de área y los últimos 2 dígitos
 */
export const maskPhone = (phone: string): string => {
  const digits = phone.replace(/[^0-9]/g, '');
  const areaCode = digits.substring(0, 3);
  const lastTwo = digits.substring(digits.length - 2);
  return `(${areaCode}) ***-**${lastTwo}`;
};

/**
 * Formatea un nombre completo con la primera letra de cada palabra en mayúscula
 */
export const formatFullName = (fullName: string): string =>
  fullName
    .trim()
    .split(/\s+/)
    .map(word => capitalize(word))
    .join(' ');

/**
 * Arma un número de teléfono dominicano a partir del código de área y el número
 */
export const formatDominicanPhone = (codigoArea: string, numeroTelefono: string): string => {
  const digits = numeroTelefono.replace(/[^0-9]/g, '');
  return `(${codigoArea}) ${digits.slice(0, 3)}-${digits.slice(3)}`;
};

/**
 * Obtiene las dos iniciales válidas (primer nombre + primer apellido) para el avatar del usuario
 */
export const getUserInitials = (primerNombre?: string, primerApellido?: string): string => {
  const primera = primerNombre?.trim().charAt(0).toUpperCase() ?? '';
  const segunda = primerApellido?.trim().charAt(0).toUpperCase() ?? '';
  const iniciales = `${primera}${segunda}`;
  return iniciales || 'MG';
};

/**
 * Formatea el texto de acuerdo al tipo de documento ingresado
 */
export const formatDocumentNumber = (value: string, category: string): string => {
  switch (category) {
    case DOCUMENT_CATEGORY.CEDULA: {
      const cleaned = value.replace(/\D/g, '').slice(0, 11);

      const first = cleaned.slice(0, 3);
      const second = cleaned.slice(3, 10);
      const third = cleaned.slice(10, 11);

      return [first, second, third].filter(Boolean).join('-');
    }

    case DOCUMENT_CATEGORY.PASSPORT:
      return value
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(0, 12)
        .toUpperCase();

    default:
      return value;
  }
};

export const sanitizeDocumentNumber = (documentCategory: string, documentNumber: string) => {
  return documentCategory === DOCUMENT_CATEGORY.PASSPORT
    ? documentNumber.toUpperCase()
    : documentNumber.replace(/[^0-9]/g, '');
};
