import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { Link } from 'react-router-dom';
import { Info } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { formatMoneda } from '../../utils/formatters';

//Componente para mostrar la lista de servicios en formato tarjeta
ListCardServicios.propTypes = {
  data: PropTypes.array, //Propiedad data, un array de objetos con la información de los servicios
};

export function ListCardServicios({ data }) {
  //Url para acceder a las imágenes guardadas en el API
  const BASE_URL = import.meta.env.VITE_BASE_URL + 'uploads';

  return (
    <Grid container sx={{ p: 2 }} spacing={3}>
      {data &&
        data.map((item) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id_servicio}>
            {/* Tarjeta para cada servicio, con la información obtenida del API (máximo 4 campos) */}
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Nombre del servicio (campo 1) */}
              <CardHeader
                sx={{
                  p: 1,
                  backgroundColor: (theme) => theme.palette.secondary.main,
                  color: (theme) => theme.palette.common.white,
                }}
                style={{ textAlign: 'center' }}
                title={item.nombre}
              />
              {/* Imagen del servicio (campo 2) */}
              {item.imagen_url && (
                <CardMedia
                  component="img"
                  height="240"
                  image={`${BASE_URL}/${item.imagen_url}`}
                  alt={item.nombre}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Edad recomendada (campo 3) */}
                <Typography variant="body1" gutterBottom>
                  <strong>Edad:</strong> {item.edad_recomendada}
                </Typography>
                {/* Tarifa (campo 4) */}
                <Typography variant="h6" align="right" color="primary">
                  {formatMoneda(item.tarifa)}
                </Typography>
              </CardContent>
              {/* Enlace al detalle del servicio */}
              <CardActions
                disableSpacing
                sx={{ backgroundColor: (theme) => theme.palette.action.focus }}
              >
                <IconButton
                  component={Link}
                  to={`/servicio/${item.id_servicio}`}
                  aria-label="Detalle"
                  sx={{ ml: 'auto' }}
                >
                  <Info />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
    </Grid>
  );
}
