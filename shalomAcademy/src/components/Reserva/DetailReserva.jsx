import { useTranslation } from 'react-i18next';
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
import { Link, useNavigate, useParams } from 'react-router-dom';
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
  const { t } = useTranslation();
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

  if (!loaded) return <p>{t('common:loading')}</p>;
  if (error) return <p>{t('common:errorPrefix', { message: error.message })}</p>;

  return (
    <Container component="main" sx={{ mt: 4, mb: 2 }}>
      {data && data.id_reserva && (
        <Paper sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 8 }}>
              <Typography variant="h4" component="h1">
                {t('reserva:detail.title', { id: data.id_reserva })}
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
              <Dato etiqueta={t('reserva:detail.generatedOn')}>{formatFechaHora(data.fecha_creacion)}</Dato>
              <Dato etiqueta={t('reserva:detail.appointmentDate')}>{formatFecha(data.fecha_cita)}</Dato>
              <Dato etiqueta={t('reserva:detail.time')}>{rangoHoras(data.hora_inicio, data.hora_fin)}</Dato>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Dato etiqueta={t('reserva:detail.client')}>{data.cliente}</Dato>
              <Dato etiqueta={t('reserva:detail.branch')}>{data.sucursal}</Dato>
              <Dato etiqueta={t('reserva:detail.service')}>
                {data.servicio} ({formatMoneda(data.precio_servicio)})
              </Dato>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Las 3 preguntas de la reserva con sus respuestas (vienen de la BD) */}
          <Typography variant="h6" gutterBottom>
            {t('reserva:detail.questions')}
          </Typography>
          <Dato etiqueta={t('reserva:detail.q1')}>
            {esVerdadero(data.practica_previa) ? t('common:yes') : t('common:no')}
          </Dato>
          <Dato etiqueta={t('reserva:detail.q2')}>{data.condicion_medica}</Dato>
          <Dato etiqueta={t('reserva:detail.q3')}>{data.objetivo}</Dato>
          {/* Enlace a la factura (proforma o facturada) asociada a la cita */}
          {data.id_factura && (
            <Box sx={{ mt: 2 }}>
              <Button component={Link} to={`/factura/${data.id_factura}`} variant="outlined">
                {t('reserva:detail.viewInvoice')}
              </Button>
            </Box>
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
