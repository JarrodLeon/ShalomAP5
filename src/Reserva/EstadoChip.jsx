import PropTypes from 'prop-types';
import Chip from '@mui/material/Chip';
import { colorTexto } from '../../utils/formatters';

EstadoChip.propTypes = {
  nombre: PropTypes.string.isRequired, //Nombre del estado
  color: PropTypes.string.isRequired, //Color en hexadecimal, viene de la BD
};

//Estado de la reserva con el color definido en la base de datos
export function EstadoChip({ nombre, color }) {
  return (
    <Chip
      label={nombre}
      size="small"
      sx={{ backgroundColor: color, color: colorTexto(color), fontWeight: 600 }}
    />
  );
}
