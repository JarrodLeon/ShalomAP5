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

//Componente para mostrar la lista de productos en formato tarjeta
ListCardProductos.propTypes = {
  data: PropTypes.array, //Propiedad data, un array de objetos con la información de los productos
};

export function ListCardProductos({ data }) {
  //Url para acceder a las imágenes guardadas en el API
  const BASE_URL = import.meta.env.VITE_BASE_URL + 'uploads';

  return (
    <Grid container sx={{ p: 2 }} spacing={3}>
      {data &&
        data.map((item) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id_producto}>
            {/* Tarjeta para cada producto, con la información obtenida del API (máximo 4 campos) */}
            <Card>
              {/* Encabezado: nombre (campo 1) y categoría (campo 2) */}
              <CardHeader
                sx={{
                  p: 1,
                  backgroundColor: (theme) => theme.palette.secondary.main,
                  color: (theme) => theme.palette.common.white,
                }}
                style={{ textAlign: 'center' }}
                title={item.nombre}
                subheader={item.nombre_categoria}
                slotProps={{
                  subheader: { sx: { color: 'common.white' } },
                }}
              />
              {/* Imagen del producto (campo 3) */}
              <CardMedia
                component="img"
                height="240"
                image={`${BASE_URL}/${item.imagen_url}`}
                alt={item.nombre}
              />
              {/* Precio (campo 4) */}
              <CardContent>
                <Typography variant="h6" align="right" color="primary">
                  {formatMoneda(item.precio)}
                </Typography>
              </CardContent>
              {/* Enlace al detalle del producto */}
              <CardActions
                disableSpacing
                sx={{ backgroundColor: (theme) => theme.palette.action.focus }}
              >
                <IconButton
                  component={Link}
                  to={`/producto/${item.id_producto}`}
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
