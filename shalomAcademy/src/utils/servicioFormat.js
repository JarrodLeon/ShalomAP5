//Convierte los minutos de un servicio a un texto legible: 45 -> '45 min', 60 -> '1 hora', 120 -> '2 horas'
export function formatDuracion(minutos) {
  const total = Number(minutos);
  if (total < 60) {
    return `${total} min`;
  }
  const horas = Math.floor(total / 60);
  const resto = total % 60;
  if (resto === 0) {
    return `${horas} ${horas === 1 ? 'hora' : 'horas'}`;
  }
  return `${horas} h ${resto} min`;
}

//Quita tildes y pasa a minúsculas, para que el filtro por nombre ignore tildes y mayúsculas
export function normalizar(texto) {
  return String(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}
