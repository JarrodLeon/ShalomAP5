import i18n from '../i18n';

//Idioma de formato (fechas y moneda) según el idioma activo de la aplicación
function locale() {
  return (i18n.resolvedLanguage || 'es').startsWith('en') ? 'en-US' : 'es-CR';
}

//Formatea un monto como colones
export function formatMoneda(valor) {
  return new Intl.NumberFormat(locale(), {
    style: 'currency',
    currency: 'CRC',
  }).format(Number(valor));
}

//Recibe 'YYYY-MM-DD' (o 'YYYY-MM-DD HH:MM:SS') y devuelve la fecha legible
export function formatFecha(texto) {
  const [anio, mes, dia] = texto.slice(0, 10).split('-').map(Number);
  return new Date(anio, mes - 1, dia).toLocaleDateString(locale(), {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

//Recibe 'YYYY-MM-DD HH:MM:SS' y devuelve fecha y hora legibles
export function formatFechaHora(texto) {
  return new Date(texto.replace(' ', 'T')).toLocaleString(locale(), {
    dateStyle: 'long',
    timeStyle: 'short',
  });
}

//Recibe 'HH:MM:SS' (24 horas, como lo guarda MySQL) y devuelve formato de 12 horas: '4:00 p. m.' / '4:00 PM'
export function formatHora(texto) {
  const [hora, minutos] = texto.split(':').map(Number);
  const sufijo = hora >= 12 ? i18n.t('common:time.pm') : i18n.t('common:time.am');
  const hora12 = hora % 12 === 0 ? 12 : hora % 12;
  return `${hora12}:${String(minutos).padStart(2, '0')} ${sufijo}`;
}

export function rangoHoras(inicio, fin) {
  return `${formatHora(inicio)} - ${formatHora(fin)}`;
}

//Elige blanco o negro como color de texto según el color de fondo
export function colorTexto(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminancia > 0.6 ? '#2B2B2B' : '#FFFFFF';
}

//Número de factura con ceros a la izquierda
export function numeroFactura(id) {
  return String(id).padStart(6, '0');
}

//El API devuelve los TINYINT como texto ('0' o '1'): esto los convierte a booleano
export function esVerdadero(valor) {
  return Number(valor) === 1;
}
