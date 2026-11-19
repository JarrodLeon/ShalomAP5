import i18n from '../i18n';

//Obtiene el mensaje de un error del API: el que envía el servidor (validaciones, ya traducido
//según el encabezado Accept-Language) o el de la conexión
export function mensajeError(error) {
  return (
    error?.response?.data?.result ||
    error?.message ||
    i18n.t('common:apiError.generic')
  );
}
