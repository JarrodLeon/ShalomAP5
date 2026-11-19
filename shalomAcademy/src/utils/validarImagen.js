//Valida la imagen seleccionada antes de enviarla al API.
//Devuelve la CLAVE del mensaje de error (se traduce al mostrarlo) o '' si es válida
export function validarImagen(file) {
  if (!file) return '';
  const tiposValidos = ['image/jpeg', 'image/png', 'image/gif'];
  if (!tiposValidos.includes(file.type)) {
    return 'validation:imagenTipo';
  }
  if (file.size > 2000000) {
    return 'validation:imagenTamano';
  }
  return '';
}
