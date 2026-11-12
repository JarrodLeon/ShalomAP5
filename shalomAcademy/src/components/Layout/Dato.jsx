import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

Dato.propTypes = {
  etiqueta: PropTypes.string.isRequired,
  children: PropTypes.node,
};

//Un dato del detalle: etiqueta en negrita y su valor
export function Dato({ etiqueta, children }) {
  return (
    <Typography component="div" variant="subtitle1" gutterBottom>
      <Box fontWeight="bold" display="inline">
        {etiqueta}:
      </Box>{' '}
      {children}
    </Typography>
  );
}
