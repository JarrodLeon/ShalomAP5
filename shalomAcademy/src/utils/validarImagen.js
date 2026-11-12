//Valida la imagen seleccionada antes de enviarla al API. Devuelve el mensaje de error o ''
export function validarImagen(file) {
  if (!file) return '';
  const tiposValidos = ['image/jpeg', 'image/png', 'image/gif'];
  if (!tiposValidos.includes(file.type)) {
    return 'Solo se permiten imágenes jpeg, jpg, png o gif';
  }
  if (file.size > 2000000) {
    return 'La imagen no puede superar los 2 MB';
  }
  return '';
}
