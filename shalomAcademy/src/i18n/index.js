import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import axios from 'axios';

//Archivos de traducción, uno por módulo (namespace) y por idioma
import esCommon from './locales/es/common.json';
import esLayout from './locales/es/layout.json';
import esHome from './locales/es/home.json';
import esValidation from './locales/es/validation.json';
import esProducto from './locales/es/producto.json';
import esServicio from './locales/es/servicio.json';
import esSucursal from './locales/es/sucursal.json';
import esHorario from './locales/es/horario.json';
import esFactura from './locales/es/factura.json';
import esReserva from './locales/es/reserva.json';
import enCommon from './locales/en/common.json';
import enLayout from './locales/en/layout.json';
import enHome from './locales/en/home.json';
import enValidation from './locales/en/validation.json';
import enProducto from './locales/en/producto.json';
import enServicio from './locales/en/servicio.json';
import enSucursal from './locales/en/sucursal.json';
import enHorario from './locales/en/horario.json';
import enFactura from './locales/en/factura.json';
import enReserva from './locales/en/reserva.json';

//Recursos: idioma -> módulo -> textos
const resources = {
  es: {
    common: esCommon,
    layout: esLayout,
    home: esHome,
    validation: esValidation,
    producto: esProducto,
    servicio: esServicio,
    sucursal: esSucursal,
    horario: esHorario,
    factura: esFactura,
    reserva: esReserva,
  },
  en: {
    common: enCommon,
    layout: enLayout,
    home: enHome,
    validation: enValidation,
    producto: enProducto,
    servicio: enServicio,
    sucursal: enSucursal,
    horario: enHorario,
    factura: enFactura,
    reserva: enReserva,
  },
};

i18n
  .use(LanguageDetector) //Detecta el idioma: primero el guardado por el usuario, luego el del navegador
  .use(initReactI18next) //Conecta i18next con React (hook useTranslation)
  .init({
    resources,
    supportedLngs: ['es', 'en'],
    fallbackLng: 'es', //Si falta una traducción o el idioma no está soportado, se usa español
    nonExplicitSupportedLngs: true, //'en-US' se trata como 'en'
    load: 'languageOnly',
    defaultNS: 'common',
    ns: Object.keys(resources.es),
    interpolation: { escapeValue: false }, //React ya escapa el contenido
    react: { useSuspense: false }, //Los recursos están incluidos en la aplicación, no se cargan por red
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'idioma', //Clave donde se guarda la preferencia
      caches: ['localStorage'], //Persistencia entre sesiones y cambios de página
    },
  });

//Mantiene el atributo lang del documento y el título de la pestaña según el idioma activo
function actualizarDocumento() {
  const idioma = i18n.resolvedLanguage || 'es';
  document.documentElement.lang = idioma;
  document.title = i18n.t('common:appTitle');
}
i18n.on('languageChanged', actualizarDocumento);
actualizarDocumento();

//Todas las peticiones al API envían el idioma activo (Accept-Language) para que los mensajes de validación lleguen traducidos
axios.interceptors.request.use((config) => {
  config.headers['Accept-Language'] = i18n.resolvedLanguage || 'es';
  return config;
});

export default i18n;
