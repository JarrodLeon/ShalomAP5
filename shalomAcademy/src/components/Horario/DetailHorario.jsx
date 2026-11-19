import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import HorarioService from '../../services/HorarioService';
import { esVerdadero, formatFecha, formatHora } from '../../utils/formatters';
import { Dato } from '../Layout/Dato';

//Componente para mostrar el detalle de un horario o de un bloqueo
export function DetailHorario() {
  const { t } = useTranslation();
  const routeParams = useParams(); //Obtener el id del registro desde la ruta
  const navigate = useNavigate(); //Función para volver a la página anterior

  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  //Llamar al API y obtener el horario o bloqueo
  useEffect(() => {
    HorarioService.getHorarioById(routeParams.id)
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

  const esBloqueo = data ? esVerdadero(data.es_bloqueo) : false;

  return (
    <Container component="main" sx={{ mt: 4, mb: 2 }}>
      {data && data.id_horario && (
        <Paper sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {esBloqueo ? t('horario:detail.blockTitle') : t('horario:detail.scheduleTitle')}
          </Typography>
          <Dato etiqueta={t('horario:detail.type')}>{esBloqueo ? t('horario:detail.typeBlock') : t('horario:detail.typeSchedule')}</Dato>
          <Dato etiqueta={t('horario:detail.branch')}>{data.sucursal}</Dato>
          <Dato etiqueta={t('horario:detail.date')}>{formatFecha(data.fecha)}</Dato>
          <Dato etiqueta={t('horario:detail.weekday')}>{t(`common:days.${data.dia_semana}`, { defaultValue: data.dia_semana })}</Dato>
          <Dato etiqueta={t('horario:detail.startTime')}>{formatHora(data.hora_inicio)}</Dato>
          <Dato etiqueta={t('horario:detail.endTime')}>{formatHora(data.hora_fin)}</Dato>
          {esBloqueo && <Dato etiqueta={t('horario:detail.reason')}>{data.motivo ? data.motivo : t('horario:list.noReason')}</Dato>}
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
