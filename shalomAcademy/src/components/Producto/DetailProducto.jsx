import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import ProductoService from '../../services/ProductoService';
import { esVerdadero, formatMoneda } from '../../utils/formatters';

//Componente para mostrar el detalle de un producto
export function DetailProducto() {
  const { t } = useTranslation();
  const routeParams = useParams(); //Obtener los parámetros de la ruta, en este caso el id del producto
  const navigate = useNavigate(); //Función para volver a la página anterior
  //Url para acceder a las imágenes guardadas en el API
  const BASE_URL = import.meta.env.VITE_BASE_URL + 'uploads';

  //Resultado de consumo del API, respuesta
  const [data, setData] = useState(null);
  //Error del API
  const [error, setError] = useState('');
  //Booleano para establecer sí se ha recibido respuesta
  const [loaded, setLoaded] = useState(false);

  //Llamar al API y obtener un producto
  useEffect(() => {
    ProductoService.getProductoById(routeParams.id) //Llamar al servicio para obtener un producto por su id
      .then((response) => {
        setData(response.data); //Almacenar la respuesta en el estado
        setLoaded(true); //Marcar como cargado
      })
      .catch((error) => {
        console.log(error);
        setError(error);
        setLoaded(true);
      });
  }, [routeParams.id]); //El efecto se ejecuta cada vez que el id del producto en los parámetros de la ruta cambia

  if (!loaded) return <p>{t('common:loading')}</p>;
  if (error) return <p>{t('common:errorPrefix', { message: error.message })}</p>;

  return (
    <Container component="main" sx={{ mt: 4, mb: 2 }}>
      {data && data.id_producto && (
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              component="img"
              sx={{ borderRadius: '4%', maxWidth: '100%', height: 'auto' }}
              alt={data.nombre}
              src={`${BASE_URL}/${data.imagen_url}`}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {data.nombre}
            </Typography>
            <Chip label={t(`producto:categorias.${data.nombre_categoria}`, { defaultValue: data.nombre_categoria })} color="secondary" sx={{ mb: 2 }} />
            <Typography variant="h5" color="primary" gutterBottom>
              {formatMoneda(data.precio)}
            </Typography>
            <Typography component="span" variant="subtitle1" display="block" gutterBottom>
              <Box fontWeight="bold" display="inline">
                {t('producto:detail.description') + ':'}
              </Box>{' '}
              {data.descripcion}
            </Typography>
            <Typography component="span" variant="subtitle1" display="block" gutterBottom>
              <Box fontWeight="bold" display="inline">
                {t('producto:detail.stock') + ':'}
              </Box>{' '}
              {t('producto:detail.stockUnits', { count: Number(data.stock_disponible) })}
            </Typography>
            <Typography component="span" variant="subtitle1" display="block">
              <Box fontWeight="bold" display="inline">
                {t('producto:detail.customizable')}:
              </Box>{' '}
              {esVerdadero(data.es_personalizable)
                ? t('producto:detail.customizableYes')
                : t('common:no')}
            </Typography>
          </Grid>
        </Grid>
      )}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          {t('common:back')}
        </Button>
      </Box>
    </Container>
  );
}
