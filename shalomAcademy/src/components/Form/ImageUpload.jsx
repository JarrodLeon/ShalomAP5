import { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography';

ImageUpload.propTypes = {
  file: PropTypes.object, //Archivo seleccionado por el usuario (File) o null
  onChange: PropTypes.func.isRequired, //Función que recibe el archivo seleccionado
  currentImage: PropTypes.string, //Nombre de la imagen guardada (al modificar)
  error: PropTypes.string, //Mensaje de validación
};

//Entrada para insertar o modificar una imagen, con vista previa
export function ImageUpload({ file, onChange, currentImage, error }) {
  //Url para acceder a las imágenes guardadas en el API
  const BASE_URL = import.meta.env.VITE_BASE_URL + 'uploads';

  //Vista previa de la imagen recién seleccionada
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const src = preview || (currentImage ? `${BASE_URL}/${currentImage}` : null);

  return (
    <Box>
      <Button variant="outlined" component="label">
        {currentImage || file ? 'Cambiar imagen' : 'Seleccionar imagen'}
        <input
          hidden
          type="file"
          accept="image/jpeg,image/png,image/gif"
          onChange={(event) => onChange(event.target.files[0] ?? null)}
        />
      </Button>
      {file && (
        <Typography variant="body2" sx={{ ml: 2 }} component="span">
          {file.name}
        </Typography>
      )}
      <FormHelperText sx={{ color: '#d32f2f' }}>{error ? error : ' '}</FormHelperText>
      {src && (
        <Box
          component="img"
          src={src}
          alt="Vista previa de la imagen"
          sx={{ mt: 1, maxWidth: 300, width: '100%', borderRadius: 2 }}
        />
      )}
    </Box>
  );
}
