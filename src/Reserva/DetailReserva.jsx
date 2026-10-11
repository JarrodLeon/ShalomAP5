import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import ReservaService from '../../services/ReservaService';
import {
  esVerdadero,
  formatFecha,
  formatFechaHora,
  formatMoneda,
  rangoHoras,
} from '../../utils/formatters';
import { EstadoChip } from './EstadoChip';

Dato.propTypes = {
  etiqueta: PropTypes.string.isRequired,
  children: PropTypes.node,
};

//Un dato del detalle: etiqueta pequeña y valor debajo
function Dato({ etiqueta, children }) {
  return (
    <>
      <Typography variant="subtitle2" color="text.secondary">
        {etiqueta}
      </Typography>
      <Typography gutterBottom component="div">
        {children}
      </Typography>
    </>
  );
}

//Componente para mostrar el detalle de una reserva
export function DetailReserva() {
  const routeParams = useParams(); //Obtener el id de la reserva desde la ruta
  const navigate = useNavigate(); //Función para volver a la página anterior

  const [data, setData] = useState(null); //Resultado de consumo del API, respuesta
  const [error, setError] = useState(''); //Error del API
  const [loaded, setLoaded] = useState(false); //Booleano para establecer sí se ha recibido respuesta

  //Llamar al API y obtener una reserva
  useEffect(() => {
    ReservaService.getReservaById(routeParams.id)
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

  if (!loaded) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <Container component="main" sx={{ mt: 4, mb: 2 }}>
      {data && data.id_reserva && (
        <Paper sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 8 }}>
              <Typography variant="h4" component="h1">
                Reserva N° {data.id_reserva}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }} sx={{ textAlign: { sm: 'right' } }}>
              {/* Estado con el color definido en la BD */}
              <EstadoChip nombre={data.nombre_estado} color={data.color_hex} />
            </Grid>
          </Grid>

          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Dato etiqueta="Reserva generada el">{formatFechaHora(data.fecha_creacion)}</Dato>
              <Dato etiqueta="Fecha de la cita">{formatFecha(data.fecha_cita)}</Dato>
              <Dato etiqueta="Hora">{rangoHoras(data.hora_inicio, data.hora_fin)}</Dato>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Dato etiqueta="Cliente">{data.cliente}</Dato>
              <Dato etiqueta="Sucursal">{data.sucursal}</Dato>
              <Dato etiqueta="Servicio">
                {data.servicio} ({formatMoneda(data.precio_servicio)})
              </Dato>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Las 3 preguntas de la reserva con sus respuestas (vienen de la BD) */}
          <Typography variant="h6" gutterBottom>
            Preguntas de la reserva
          </Typography>
          <Dato etiqueta="1. ¿Ha practicado gimnasia antes?">
            {esVerdadero(data.practica_previa) ? 'Sí' : 'No'}
          </Dato>
          <Dato etiqueta="2. ¿Tiene alguna lesión o condición médica?">{data.condicion_medica}</Dato>
          <Dato etiqueta="3. ¿Cuál es el objetivo de la clase?">{data.objetivo}</Dato>
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
