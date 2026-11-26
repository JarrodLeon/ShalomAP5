//Fecha actual en formato yyyy-mm-dd (la misma que entrega la entrada de fecha)
export function fechaActualISO() {
  return new Date().toLocaleDateString('en-CA');
}

//Suma minutos a una hora 'HH:MM'. Devuelve { hora: 'HH:MM', cruza: true si pasa a otro día }
export function sumarMinutos(hhmm, minutos) {
  const [horas, mins] = hhmm.split(':').map(Number);
  const total = horas * 60 + mins + Number(minutos);
  const dentroDelDia = total % 1440;
  const h = String(Math.floor(dentroDelDia / 60)).padStart(2, '0');
  const m = String(dentroDelDia % 60).padStart(2, '0');
  return { hora: `${h}:${m}`, cruza: total >= 1440 };
}
