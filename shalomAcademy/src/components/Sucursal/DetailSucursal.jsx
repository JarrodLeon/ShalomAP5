import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import SucursalService from '../../services/SucursalService';
import { Dato } from '../Layout/Dato';

//Componente para mostrar el detalle de una sucursal
export function DetailSucursal() {
  const { t } = useTranslation();
  const routeParams = useParams(); //Obtener los parámetros de la ruta, en este caso el id de la sucursal
  const navigate = useNavigate(); //Función para volver a la página anterior

  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  //Llamar al API y obtener una sucursal
  useEffect(() => {
    SucursalService.getSucursalById(routeParams.id)
      .then((response) => {
        setData(response.data);
        setLoaded(true);
      })
      .catch((error) => {
        console.log(error);
        setError(error);
        setLoaded(true);
      });
  }, [routeParams.id]);

  if (!loaded) return <p>{t('common:loading')}</p>;
  if (error) return <p>{t('common:errorPrefix', { message: error.message })}</p>;

  return (
    <Container component="main" sx={{ mt: 4, mb: 2 }}>
      {data && data.id_sucursal && (
        <Paper sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {t('sucursal:detail.title')}
          </Typography>
          <Dato etiqueta={t('common:name')}>{data.nombre}</Dato>
          <Dato etiqueta={t('common:description')}>{data.descripcion}</Dato>
          <Dato etiqueta={t('sucursal:detail.phone')}>{data.telefono}</Dato>
          <Dato etiqueta={t('sucursal:detail.address')}>{data.direccion_exacta}</Dato>
          <Dato etiqueta={t('sucursal:detail.email')}>{data.correo_electronico}</Dato>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
            {t('sucursal:detail.managers') + ':'}
          </Typography>
          {data.encargados.length > 0 ? (
            <List dense>
              {data.encargados.map((encargado) => (
                <ListItem key={encargado.id_usuario}>
                  <ListItemText primary={encargado.nombre} secondary={encargado.correo} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>{t('sucursal:detail.noManagers')}</Typography>
          )}
        </Paper>
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
