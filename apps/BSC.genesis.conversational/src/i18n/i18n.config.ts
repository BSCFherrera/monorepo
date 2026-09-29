import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';

// Importación de JSON por funcionalidad/módulo (carpeta: src/i18n/locales/es)
import auth from './locales/es/auth.json';
import onboarding from './locales/es/onboarding.json';
import chat from './locales/es/chat.json';
import accessRecovery from './locales/es/accessRecovery.json';
import general from './locales/es/general.json';

const resources = {
  es: {
    auth,
    onboarding,
    chat,
    accessRecovery,
    general,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'es',
  fallbackLng: 'es',
  defaultNS: 'onboarding',
  ns: Object.keys(resources.es),
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
