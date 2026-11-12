//Obtiene el mensaje de un error del API: el que envía el servidor (validaciones) o el de la conexión
export function mensajeError(error) {
  return (
    error?.response?.data?.result ||
    error?.message ||
    'No se pudo completar la operación'
  );
}
