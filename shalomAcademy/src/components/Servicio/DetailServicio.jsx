import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import ServicioService from '../../services/ServicioService';
import { formatMoneda } from '../../utils/formatters';
import { formatDuracion } from '../../utils/servicioFormat';

Dato.propTypes = {
  etiqueta: PropTypes.string.isRequired,
  children: PropTypes.node,
};

//Un dato del detalle: etiqueta en negrita y su valor
function Dato({ etiqueta, children }) {
  return (
    <Typography component="div" variant="subtitle1" gutterBottom>
      <Box fontWeight="bold" display="inline">
        {etiqueta}:
      </Box>{' '}
      {children}
    </Typography>
  );
}

//Componente para mostrar el detalle de un servicio
export function DetailServicio() {
  const routeParams = useParams(); //Obtener los parámetros de la ruta, en este caso el id del servicio
  const navigate = useNavigate(); //Función para volver a la página anterior
  //Url para acceder a las imágenes guardadas en el API
  const BASE_URL = import.meta.env.VITE_BASE_URL + 'uploads';

  //Resultado de consumo del API, respuesta
  const [data, setData] = useState(null);
  //Error del API
  const [error, setError] = useState('');
  //Booleano para establecer sí se ha recibido respuesta
  const [loaded, setLoaded] = useState(false);

  //Llamar al API y obtener un servicio
  useEffect(() => {
    ServicioService.getServicioById(routeParams.id) //Llamar al servicio para obtener un servicio por su id
      .then((response) => {
        setData(response.data); //Almacenar la respuesta en el estado
        setLoaded(true); //Marcar como cargado
      })
      .catch((error) => {
        console.log(error);
        setError(error);
        setLoaded(true);
      });
  }, [routeParams.id]); //El efecto se ejecuta cada vez que el id del servicio en los parámetros de la ruta cambia

  if (!loaded) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <Container component="main" sx={{ mt: 4, mb: 2 }}>
      {data && data.id_servicio && (
        <Paper sx={{ p: 4, maxWidth: 1000, mx: 'auto' }}>
          <Grid container spacing={4}>
            {/* Imagen del servicio */}
            {data.imagen_url && (
              <Grid size={{ xs: 12, md: 5 }}>
                <Box
                  component="img"
                  sx={{ borderRadius: '4%', maxWidth: '100%', height: 'auto' }}
                  alt={data.nombre}
                  src={`${BASE_URL}/${data.imagen_url}`}
                />
              </Grid>
            )}
            <Grid size={{ xs: 12, md: data.imagen_url ? 7 : 12 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                Detalle del servicio
              </Typography>
              <Dato etiqueta="Nombre">{data.nombre}</Dato>
              <Dato etiqueta="Descripción">{data.descripcion}</Dato>
              <Dato etiqueta="Tarifa">{formatMoneda(data.tarifa)}</Dato>
              <Dato etiqueta="Duración">{formatDuracion(data.tiempo_servicio)}</Dato>
              <Dato etiqueta="Modalidad">{data.modalidad}</Dato>
              <Dato etiqueta="Edad recomendada">{data.edad_recomendada}</Dato>
            </Grid>
          </Grid>
        </Paper>
      )}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Regresar
        </Button>
      </Box>
    </Container>
  );
}
