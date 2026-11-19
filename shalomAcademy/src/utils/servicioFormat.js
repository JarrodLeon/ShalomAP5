import i18n from '../i18n';

//Convierte los minutos de un servicio a un texto legible en el idioma activo:
//45 -> '45 min', 60 -> '1 hora' / '1 hour', 120 -> '2 horas' / '2 hours'
export function formatDuracion(minutos) {
  const total = Number(minutos);
  if (total < 60) {
    return i18n.t('servicio:duracion.min', { count: total });
  }
  const horas = Math.floor(total / 60);
  const resto = total % 60;
  if (resto === 0) {
    return i18n.t('servicio:duracion.hour', { count: horas });
  }
  return i18n.t('servicio:duracion.hoursMinutes', { hours: horas, minutes: resto });
}

//Quita tildes y pasa a minúsculas, para que el filtro por nombre ignore tildes y mayúsculas
export function normalizar(texto) {
  return String(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}
